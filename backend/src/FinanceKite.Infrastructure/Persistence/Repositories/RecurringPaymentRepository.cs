using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class RecurringPaymentRepository(ApplicationDbContext context) : IRecurringPaymentRepository
{
    public async Task<RecurringPayment?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.RecurringPayments
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId, cancellationToken);

    public async Task<IReadOnlyList<RecurringPayment>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.RecurringPayments
            .Where(r => r.BusinessId == businessId)
            .OrderBy(r => r.NextDueDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<RecurringPayment>> GetDueAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await context.RecurringPayments
            .Include(r => r.Business)
            .Where(r => r.IsActive && r.NextDueDate.Date <= today)
            .OrderBy(r => r.NextDueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<RecurringPayment> CreateAsync(RecurringPayment payment, CancellationToken cancellationToken = default)
    {
        await context.RecurringPayments.AddAsync(payment, cancellationToken);
        return payment;
    }

    public Task UpdateAsync(RecurringPayment payment, CancellationToken cancellationToken = default)
    {
        context.RecurringPayments.Update(payment);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
    {
        var payment = await context.RecurringPayments
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId, cancellationToken);
        if (payment is not null)
            context.RecurringPayments.Remove(payment);
    }
}
