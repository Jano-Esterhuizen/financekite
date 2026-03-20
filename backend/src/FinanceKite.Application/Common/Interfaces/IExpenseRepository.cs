using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Expense>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Expense>> GetAllByClientIdAsync(Guid clientId, Guid businessId, CancellationToken cancellationToken = default);
    Task<Expense> CreateAsync(Expense expense, CancellationToken cancellationToken = default);
    Task UpdateAsync(Expense expense, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
}