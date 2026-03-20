namespace FinanceKite.Application.Features.Invoices;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Http;

public class InvoiceService(
    IInvoiceRepository invoiceRepository,
    IBusinessRepository businessRepository,
    IStorageService storageService,
    IUnitOfWork unitOfWork,
    IValidator<CreateInvoiceRequest> createValidator,
    IValidator<UpdateInvoiceRequest> updateValidator)
{
    public async Task<IReadOnlyList<InvoiceResponse>> GetAllAsync(
        Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var invoices = await invoiceRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return invoices.Select(i => i.ToResponse()).ToList();
    }

    public async Task<InvoiceResponse> GetByIdAsync(
        Guid id, Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);
        return invoice.ToResponse();
    }

    public async Task<IReadOnlyList<InvoiceResponse>> GetOverdueAsync(
        Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var invoices = await invoiceRepository.GetOverdueAsync(businessId, cancellationToken);
        return invoices.Select(i => i.ToResponse()).ToList();
    }

    public async Task<InvoiceResponse> CreateAsync(
        Guid businessId, Guid userId, CreateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(createValidator, request, cancellationToken);
        var invoice = new Invoice
        {
            BusinessId = businessId,
            ClientId = request.ClientId,
            InvoiceNumber = request.InvoiceNumber,
            Amount = request.Amount,
            IssuedDate = request.IssuedDate,
            DueDate = request.DueDate,
            Notes = request.Notes
        };
        await invoiceRepository.CreateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var created = await invoiceRepository.GetByIdAsync(invoice.Id, businessId, cancellationToken);
        return created!.ToResponse();
    }

    public async Task<InvoiceResponse> UpdateAsync(
        Guid id, Guid businessId, Guid userId, UpdateInvoiceRequest request, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(updateValidator, request, cancellationToken);
        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);
        invoice.InvoiceNumber = request.InvoiceNumber;
        invoice.Amount = request.Amount;
        invoice.Status = request.Status;
        invoice.IssuedDate = request.IssuedDate;
        invoice.DueDate = request.DueDate;
        invoice.Notes = request.Notes;
        invoice.UpdatedAt = DateTime.UtcNow;
        await invoiceRepository.UpdateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return invoice.ToResponse();
    }

    public async Task<InvoiceResponse> UploadDocumentAsync(
        Guid id, Guid businessId, Guid userId, IFormFile file, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);
        if (!string.IsNullOrEmpty(invoice.DocumentUrl))
            await storageService.DeleteFileAsync(invoice.DocumentUrl, cancellationToken);
        using var stream = file.OpenReadStream();
        invoice.DocumentUrl = await storageService.UploadFileAsync(
            stream, file.FileName, file.ContentType, $"invoices/{businessId}", cancellationToken);
        invoice.UpdatedAt = DateTime.UtcNow;
        await invoiceRepository.UpdateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return invoice.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id, Guid businessId, Guid userId, CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);
        if (!string.IsNullOrEmpty(invoice.DocumentUrl))
            await storageService.DeleteFileAsync(invoice.DocumentUrl, cancellationToken);
        await invoiceRepository.DeleteAsync(id, businessId, cancellationToken);
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
