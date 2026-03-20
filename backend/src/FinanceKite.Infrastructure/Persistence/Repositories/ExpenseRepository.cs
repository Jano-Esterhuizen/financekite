using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ExpenseRepository(ApplicationDbContext context) : IExpenseRepository
{
    public async Task<Expense?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Expenses
            .Include(e => e.Client)
            .FirstOrDefaultAsync(e => e.Id == id && e.BusinessId == businessId, cancellationToken);

    public async Task<IReadOnlyList<Expense>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.Expenses
            .Include(e => e.Client)
            .Where(e => e.BusinessId == businessId)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Expense>> GetAllByClientIdAsync(Guid clientId, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Expenses
            .Include(e => e.Client)
            .Where(e => e.ClientId == clientId && e.BusinessId == businessId)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);

    public async Task<Expense> CreateAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        await context.Expenses.AddAsync(expense, cancellationToken);
        return expense;
    }

    public Task UpdateAsync(Expense expense, CancellationToken cancellationToken = default)
    {
        context.Expenses.Update(expense);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
    {
        var expense = await context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.BusinessId == businessId, cancellationToken);
        if (expense is not null)
            context.Expenses.Remove(expense);
    }
}
