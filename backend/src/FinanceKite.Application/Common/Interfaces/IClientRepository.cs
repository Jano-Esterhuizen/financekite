using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Client>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default);
    Task UpdateAsync(Client client, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
}