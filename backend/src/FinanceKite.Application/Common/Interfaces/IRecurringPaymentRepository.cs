using System;

namespace FinanceKite.Application.Common.Interfaces;

using FinanceKite.Domain.Entities;

public interface IRecurringPaymentRepository
{
    Task<RecurringPayment?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecurringPayment>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RecurringPayment>> GetDueAsync(CancellationToken cancellationToken = default);
    Task<RecurringPayment> CreateAsync(RecurringPayment payment, CancellationToken cancellationToken = default);
    Task UpdateAsync(RecurringPayment payment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default);
}
