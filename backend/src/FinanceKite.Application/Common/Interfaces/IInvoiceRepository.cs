using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IInvoiceRepository
{
    Task<Invoice?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> GetAllByClientIdAsync(Guid clientId, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> GetOverdueAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<Invoice> CreateAsync(Invoice invoice, CancellationToken cancellationToken = default);
    Task UpdateAsync(Invoice invoice, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Invoice>> GetPendingOverdueAsync(CancellationToken cancellationToken = default);
}
