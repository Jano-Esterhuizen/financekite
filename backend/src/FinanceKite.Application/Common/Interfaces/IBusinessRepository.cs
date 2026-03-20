using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Business>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Business> CreateAsync(Business business, CancellationToken cancellationToken = default);
    Task UpdateAsync(Business business, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
}
