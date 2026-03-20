using System;

namespace FinanceKite.Application.Features.Clients;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;

public class ClientService(
    IClientRepository clientRepository,
    IBusinessRepository businessRepository,
    IUnitOfWork unitOfWork,
    IValidator<CreateClientRequest> createValidator,
    IValidator<UpdateClientRequest> updateValidator)
{
    public async Task<IReadOnlyList<ClientResponse>> GetAllAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var clients = await clientRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return clients.Select(c => c.ToResponse()).ToList();
    }

    public async Task<ClientResponse> GetByIdAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var client = await clientRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Client), id);

        return client.ToResponse();
    }

    public async Task<ClientHealthResponse> GetClientHealthAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var client = await clientRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Client), id);

        // Total invoiced = all invoices regardless of status
        var totalInvoiced = client.Invoices.Sum(i => i.Amount);

        // Outstanding = only Pending and Overdue invoices
        var outstandingBalance = client.Invoices
            .Where(i => i.Status == InvoiceStatus.Pending || i.Status == InvoiceStatus.Overdue)
            .Sum(i => i.Amount);

        return new ClientHealthResponse(
            client.Id,
            client.Name,
            totalInvoiced,
            outstandingBalance);
    }

    public async Task<ClientResponse> CreateAsync(
        Guid businessId,
        Guid userId,
        CreateClientRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(createValidator, request, cancellationToken);

        var client = new Client
        {
            BusinessId = businessId,
            Name = request.Name,
            CompanyName = request.CompanyName,
            Email = request.Email,
            Phone = request.Phone,
            Address = request.Address
        };

        await clientRepository.CreateAsync(client, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return client.ToResponse();
    }

    public async Task<ClientResponse> UpdateAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        UpdateClientRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(updateValidator, request, cancellationToken);

        var client = await clientRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Client), id);

        client.Name = request.Name;
        client.CompanyName = request.CompanyName;
        client.Email = request.Email;
        client.Phone = request.Phone;
        client.Address = request.Address;
        client.UpdatedAt = DateTime.UtcNow;

        await clientRepository.UpdateAsync(client, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return client.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var client = await clientRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Client), id);

        await clientRepository.DeleteAsync(client.Id, businessId, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    // Reusable ownership check — avoids repeating this logic in every method
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

/*
📘 Why VerifyBusinessOwnershipAsync instead of loading the business first? 
We only need to know if the business exists and belongs to this user
We don't need the business object itself. ExistsAsync runs a lightweight SELECT 1 query instead of loading the full entity. 
For methods called on every request, this small optimization adds up.
*/
