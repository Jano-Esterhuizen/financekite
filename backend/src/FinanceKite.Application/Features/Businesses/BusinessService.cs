using System;

namespace FinanceKite.Application.Features.Businesses;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;

public class BusinessService(
    IBusinessRepository businessRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateBusinessRequest> createValidator,
    IValidator<UpdateBusinessRequest> updateValidator)
{
    public async Task<IReadOnlyList<BusinessResponse>> GetAllAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var businesses = await businessRepository.GetAllByUserIdAsync(userId, cancellationToken);

        return businesses.Select(b => b.ToResponse()).ToList();
    }

    public async Task<BusinessResponse> GetByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var business = await businessRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Business), id);

        if (business.UserId != userId)
            throw new UnauthorizedAccessException();

        return business.ToResponse();
    }

    public async Task<BusinessResponse> CreateAsync(
        Guid userId,
        CreateBusinessRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateAsync(createValidator, request, cancellationToken);

        var business = new Business
        {
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            CurrencyCode = request.CurrencyCode
        };

        await businessRepository.CreateAsync(business, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return business.ToResponse();
    }

    public async Task<BusinessResponse> UpdateAsync(
        Guid id,
        Guid userId,
        UpdateBusinessRequest request,
        CancellationToken cancellationToken = default)
    {
        await ValidateAsync(updateValidator, request, cancellationToken);

        var business = await businessRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Business), id);

        if (business.UserId != userId)
            throw new UnauthorizedAccessException();

        business.Name = request.Name;
        business.Description = request.Description;
        business.CurrencyCode = request.CurrencyCode;
        business.UpdatedAt = DateTime.UtcNow;

        await businessRepository.UpdateAsync(business, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return business.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var business = await businessRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Business), id);

        if (business.UserId != userId)
            throw new UnauthorizedAccessException();

        await businessRepository.DeleteAsync(id, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // Private helper — keeps every public method clean
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
                    g => g.Select(e => e.ErrorMessage).ToArray()
                );
            throw new Common.Exceptions.ValidationException(errors);
        }
    }
}
