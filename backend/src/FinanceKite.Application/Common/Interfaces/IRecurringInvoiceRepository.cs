using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IRecurringInvoiceRepository
{
    Task<RecurringInvoice?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecurringInvoice>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecurringInvoice>> GetDueAsync(CancellationToken cancellationToken = default);
    Task<RecurringInvoice> CreateAsync(RecurringInvoice invoice, CancellationToken cancellationToken = default);
    Task UpdateAsync(RecurringInvoice invoice, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
}
