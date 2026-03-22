using System;

namespace FinanceKite.Application.Features.Expenses;

using FinanceKite.Application.Common.Exceptions;
using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Http;

public class ExpenseService(
    IExpenseRepository expenseRepository,
    IBusinessRepository businessRepository,
    IStorageService storageService,
    IUnitOfWork unitOfWork,
    IValidator<CreateExpenseRequest> createValidator,
    IValidator<UpdateExpenseRequest> updateValidator)
{
    public async Task<IReadOnlyList<ExpenseResponse>> GetAllAsync(
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var expenses = await expenseRepository.GetAllByBusinessIdAsync(businessId, cancellationToken);
        return expenses.Select(e => e.ToResponse()).ToList();
    }

    public async Task<ExpenseResponse> GetByIdAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Expense), id);

        return expense.ToResponse();
    }

    public async Task<ExpenseResponse> CreateAsync(
        Guid businessId,
        Guid userId,
        CreateExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(createValidator, request, cancellationToken);

        var expense = new Expense
        {
            BusinessId = businessId,
            ClientId = request.ClientId,
            Description = request.Description,
            Amount = request.Amount,
            Date = request.Date,
            Category = request.Category,
            Notes = request.Notes
        };

        await expenseRepository.CreateAsync(expense, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await expenseRepository.GetByIdAsync(expense.Id, businessId, cancellationToken);
        return created!.ToResponse();
    }

    public async Task<ExpenseResponse> UpdateAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        UpdateExpenseRequest request,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);
        await ValidateAsync(updateValidator, request, cancellationToken);

        var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Expense), id);

        expense.Description = request.Description;
        expense.Amount = request.Amount;
        expense.Date = request.Date;
        expense.Category = request.Category;
        expense.ClientId = request.ClientId;
        expense.Notes = request.Notes;
        expense.UpdatedAt = DateTime.UtcNow;

        await expenseRepository.UpdateAsync(expense, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return expense.ToResponse();
    }

    public async Task<ExpenseResponse> UploadProofOfPaymentAsync(
    Guid id,
    Guid businessId,
    Guid userId,
    IFormFile file,
    CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Expense), id);

        // Validate file type — PDFs and images allowed for proof of payment
        var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/png" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
                { "file", ["Only PDF, JPEG, and PNG files are allowed for proof of payment."] }
                });

        // Validate file size — max 10MB
        if (file.Length > 10 * 1024 * 1024)
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
                { "file", ["File size cannot exceed 10MB."] }
                });

        // Prevent overwriting — user must delete existing proof first
        if (!string.IsNullOrEmpty(expense.ProofOfPaymentUrl))
            throw new Common.Exceptions.ValidationException(
                new Dictionary<string, string[]>
                {
            { "file", ["A proof of payment already exists. Please delete it before uploading a new one."] }
                });

        using var stream = file.OpenReadStream();
        expense.ProofOfPaymentUrl = await storageService.UploadFileAsync(
            stream,
            file.FileName,
            file.ContentType,
            $"expenses/{businessId}",
            cancellationToken);

        expense.UpdatedAt = DateTime.UtcNow;

        await expenseRepository.UpdateAsync(expense, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return expense.ToResponse();
    }

    public async Task DeleteAsync(
        Guid id,
        Guid businessId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Expense), id);

        if (!string.IsNullOrEmpty(expense.ProofOfPaymentUrl))
            await storageService.DeleteFileAsync(expense.ProofOfPaymentUrl, cancellationToken);

        await expenseRepository.DeleteAsync(id, businessId, cancellationToken);
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

    public async Task<string> GetProofOfPaymentUrlAsync(
    Guid id,
    Guid businessId,
    Guid userId,
    CancellationToken cancellationToken = default)
    {
        await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

        var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
            ?? throw new NotFoundException(nameof(Expense), id);

        if (string.IsNullOrEmpty(expense.ProofOfPaymentUrl))
            throw new NotFoundException("Proof of payment", id);

        return await storageService.GetSignedUrlAsync(
            expense.ProofOfPaymentUrl,
            expiresInSeconds: 3600,
            cancellationToken);
    }

    public async Task DeleteProofOfPaymentAsync(
    Guid id,
    Guid businessId,
    Guid userId,
    CancellationToken cancellationToken = default)
{
    await VerifyBusinessOwnershipAsync(businessId, userId, cancellationToken);

    var expense = await expenseRepository.GetByIdAsync(id, businessId, cancellationToken)
        ?? throw new NotFoundException(nameof(Expense), id);

    if (string.IsNullOrEmpty(expense.ProofOfPaymentUrl))
        throw new NotFoundException("Proof of payment", id);

    await storageService.DeleteFileAsync(expense.ProofOfPaymentUrl, cancellationToken);

    expense.ProofOfPaymentUrl = null;
    expense.UpdatedAt = DateTime.UtcNow;

    await expenseRepository.UpdateAsync(expense, cancellationToken);
    await unitOfWork.SaveChangesAsync(cancellationToken);
}
}
