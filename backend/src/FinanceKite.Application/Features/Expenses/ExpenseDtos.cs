using System;

namespace FinanceKite.Application.Features.Expenses;

using FinanceKite.Domain.Entities;

public record CreateExpenseRequest(
    string Description,
    decimal Amount,
    DateTime Date,
    ExpenseCategory Category,
    Guid? ClientId,
    string? Notes
);

public record UpdateExpenseRequest(
    string Description,
    decimal Amount,
    DateTime Date,
    ExpenseCategory Category,
    Guid? ClientId,
    string? Notes
);

public record ExpenseResponse(
    Guid Id,
    Guid BusinessId,
    Guid? ClientId,
    string? ClientName,
    string Description,
    decimal Amount,
    DateTime Date,
    ExpenseCategory Category,
    string? ProofOfPaymentUrl,
    string? Notes,
    DateTime CreatedAt
);
