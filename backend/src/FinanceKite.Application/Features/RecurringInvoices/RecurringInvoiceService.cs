using System;

namespace FinanceKite.Application.Features.RecurringInvoices;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;

public class RecurringInvoiceService(
    IRecurringInvoiceRepository recurringInvoiceRepository,
    IBusinessRepository businessRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateRecurringInvoiceRequest> createValidator,
    IValidator<UpdateRecurringInvoiceRequest> updateValidator)
{
    public async Task<IReadOnlyList<RecurringInvoiceResponse>> GetAllAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoices = await recurringInvoiceRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return invoices.Select(i => i.ToResponse()).ToList();
    }

    public async Task<RecurringInvoiceResponse> GetByIdAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await recurringInvoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringInvoice), id);

        return invoice.ToResponse();
    }

    public async Task<RecurringInvoiceResponse> CreateAsync(
        Guid businessId,
        Guid userId,
        CreateRecurringInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(createValidator, request, cancellationToken);

        var invoice = new RecurringInvoice
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

        await recurringInvoiceRepository.CreateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await recurringInvoiceRepository.GetByIdAsync(invoice.Id, businessId, cancellationToken);
        return created!.ToResponse();
    }

    public async Task<RecurringInvoiceResponse> UpdateAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        UpdateRecurringInvoiceRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(updateValidator, request, cancellationToken);

        var invoice = await recurringInvoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringInvoice), id);

        invoice.Description = request.Description;
        invoice.Amount = request.Amount;
        invoice.BillingCycle = request.BillingCycle;
        invoice.NextDueDate = request.NextDueDate;
        invoice.IsActive = request.IsActive;
        invoice.ClientId = request.ClientId;
        invoice.Notes = request.Notes;
        invoice.UpdatedAt = DateTime.UtcNow;

        await recurringInvoiceRepository.UpdateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await recurringInvoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(RecurringInvoice), id);

        await recurringInvoiceRepository.DeleteAsync(invoice.Id, businessId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task VerifyBusinessOwnershipAsync(Guid businessId, Guid userId, CancellationToken cancellationToken)
    {
        var exists = await businessRepository.ExistsAsync(businessId, userId, cancellationToken);
        if (!exists)
            throw new Common.Exceptions.UnauthorizedAccessException();
    }

    private static async Task ValidateAsync<T>(
        IValidator<T> validator,
        T request,
        CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(request, cancellationToken);
        if (!result.IsValid)
        {
            var errors = result.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray());
            throw new Common.Exceptions.ValidationException(errors);
        }
    }
}
