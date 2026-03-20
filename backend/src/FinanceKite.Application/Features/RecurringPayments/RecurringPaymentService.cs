namespace FinanceKite.Application.Features.RecurringPayments;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;

public class RecurringPaymentService(
    IRecurringPaymentRepository recurringPaymentRepository,
    IBusinessRepository businessRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateRecurringPaymentRequest> createValidator,
    IValidator<UpdateRecurringPaymentRequest> updateValidator)
{
    public async Task<IReadOnlyList<RecurringPaymentResponse>> GetAllAsync(
        Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var payments = await recurringPaymentRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return payments.Select(p => p.ToResponse()).ToList();
    }

    public async Task<RecurringPaymentResponse> GetByIdAsync(
        Guid id, Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var payment = await recurringPaymentRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringPayment), id);
        return payment.ToResponse();
    }

    public async Task<RecurringPaymentResponse> CreateAsync(
        Guid businessId, Guid userId, CreateRecurringPaymentRequest request, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(createValidator, request, cancellationToken);
        var payment = new RecurringPayment
        {
            BusinessId = businessId,
            ClientId = request.ClientId,
            Description = request.Description,
            Amount = request.Amount,
            BillingCycle = request.BillingCycle,
            StartDate = request.StartDate,
            NextDueDate = request.NextDueDate,
            Notes = request.Notes
        };
        await recurringPaymentRepository.CreateAsync(payment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var created = await recurringPaymentRepository.GetByIdAsync(payment.Id, businessId, cancellationToken);
        return created!.ToResponse();
    }

    public async Task<RecurringPaymentResponse> UpdateAsync(
        Guid id, Guid businessId, Guid userId, UpdateRecurringPaymentRequest request, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(updateValidator, request, cancellationToken);
        var payment = await recurringPaymentRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringPayment), id);
        payment.Description = request.Description;
        payment.Amount = request.Amount;
        payment.BillingCycle = request.BillingCycle;
        payment.NextDueDate = request.NextDueDate;
        payment.IsActive = request.IsActive;
        payment.ClientId = request.ClientId;
        payment.Notes = request.Notes;
        payment.UpdatedAt = DateTime.UtcNow;
        await recurringPaymentRepository.UpdateAsync(payment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return payment.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id, Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var payment = await recurringPaymentRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringPayment), id);
        await recurringPaymentRepository.DeleteAsync(payment.Id, businessId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task VerifyBusinessOwnershipAsync(Guid businessId, Guid userId, CancellationToken cancellationToken)
    {
        var exists = await businessRepository.ExistsAsync(businessId, userId, cancellationToken);
        if (!exists) throw new Common.Exceptions.UnauthorizedAccessException();
    }

    private static async Task ValidateAsync<T>(IValidator<T> validator, T request, CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
        {
            var errors = result.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
            throw new Common.Exceptions.ValidationException(errors);
        }
    }
}
