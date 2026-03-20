using System;

namespace FinanceKite.Application.Features.Expenses;

using FinanceKite.Domain.Entities;

public static class ExpenseMappings
{
    public static ExpenseResponse ToResponse(this Expense expense) =>
        new(
            expense.Id,
            expense.BusinessId,
            expense.ClientId,
            expense.Client?.Name,
            expense.Description,
            expense.Amount,
            expense.Date,
            expense.Category,
            expense.ProofOfPaymentUrl,
            expense.Notes,
            expense.CreatedAt
        );
}
