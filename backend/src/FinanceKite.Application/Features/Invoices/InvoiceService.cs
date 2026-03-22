using System;

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
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoices = await invoiceRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return invoices.Select(i => i.ToResponse()).ToList();
    }

    public async Task<InvoiceResponse> GetByIdAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);

        return invoice.ToResponse();
    }

    public async Task<IReadOnlyList<InvoiceResponse>> GetOverdueAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoices = await invoiceRepository.GetOverdueAsync(businessId, cancellationToken);
        return invoices.Select(i => i.ToResponse()).ToList();
    }

    public async Task<InvoiceResponse> CreateAsync(
        Guid businessId,
        Guid userId,
        CreateInvoiceRequest request,
        CancellationToken cancellationToken = default)
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

        // Reload with client navigation property populated for the response
        var created = await invoiceRepository.GetByIdAsync(invoice.Id, businessId, cancellationToken);
        return created!.ToResponse();
    }

    public async Task<InvoiceResponse> UpdateAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        UpdateInvoiceRequest request,
        CancellationToken cancellationToken = default)
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
    Guid id,
    Guid businessId,
    Guid userId,
    IFormFile file,
    CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);

        // Validate file type — only PDFs allowed for invoices
        if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
                { "file", ["Only PDF files are allowed for invoice documents."] }
                });

        // Validate file size — max 10MB
        // We also have a limit that we set in supabase storage, but validating here allows us to return a friendly error message rather than just failing on the storage upload.
        if (file.Length > 0.25 * 1024 * 1024)
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
                { "file", ["File size cannot exceed 250KB."] }
                });

        // Prevent overwriting — user must delete existing document first
        if (!string.IsNullOrEmpty(invoice.DocumentUrl))
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
            { "file", ["An invoice document already exists. Please delete it before uploading a new one."] }
                });

        using var stream = file.OpenReadStream();
        invoice.DocumentUrl = await storageService.UploadFileAsync(
            stream,
            file.FileName,
            file.ContentType,
            $"invoices/{businessId}",
            cancellationToken);

        invoice.UpdatedAt = DateTime.UtcNow;

        await invoiceRepository.UpdateAsync(invoice, cancellationToken);
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

        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);

        // Clean up storage file if one exists
        if (!string.IsNullOrEmpty(invoice.DocumentUrl))
            await storageService.DeleteFileAsync(invoice.DocumentUrl, cancellationToken);

        await invoiceRepository.DeleteAsync(id, businessId, cancellationToken);
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

    public async Task<string> GetDocumentUrlAsync(
    Guid id,
    Guid businessId,
    Guid userId,
    CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);

        if (string.IsNullOrEmpty(invoice.DocumentUrl))
            throw new NotFoundException("Document", id);

        return await storageService.GetSignedUrlAsync(
            invoice.DocumentUrl,
            expiresInSeconds: 3600,
            cancellationToken);
    }

    public async Task DeleteDocumentAsync(
    Guid id,
    Guid businessId,
    Guid userId,
    CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var invoice = await invoiceRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Invoice), id);

        if (string.IsNullOrEmpty(invoice.DocumentUrl))
            throw new NotFoundException("Document", id);

        await storageService.DeleteFileAsync(invoice.DocumentUrl, cancellationToken);

        invoice.DocumentUrl = null;
        invoice.UpdatedAt = DateTime.UtcNow;

        await invoiceRepository.UpdateAsync(invoice, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

/*
📘 Why reload the invoice after creation? When we create an invoice we only set ClientId
The Client navigation property is not populated. The ToResponse() mapping uses invoice.Client?.Name, 
so without reloading we'd return an empty client name. One extra query on creation is a worthwhile tradeoff for a complete response.

📘 Why delete the old file before uploading a new one? Supabase Storage charges for storage used. 
If we just overwrite the reference in the database without deleting the old file, 
the old PDF orphans in storage and accumulates cost. Always clean up old files when replacing them.
*/
