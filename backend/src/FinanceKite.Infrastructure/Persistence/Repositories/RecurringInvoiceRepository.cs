using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class RecurringInvoiceRepository(ApplicationDbContext context) : IRecurringInvoiceRepository
{
    public async Task<RecurringInvoice?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.RecurringInvoices
            .Include(r => r.Client)
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId, cancellationToken);

    public async Task<IReadOnlyList<RecurringInvoice>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.RecurringInvoices
            .Include(r => r.Client)
            .Where(r => r.BusinessId == businessId)
            .OrderBy(r => r.NextDueDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<RecurringInvoice>> GetDueAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        return await context.RecurringInvoices
            .Include(r => r.Client)
            .Include(r => r.Business)
            .Where(r => r.IsActive && r.NextDueDate.Date <= today)
            .OrderBy(r => r.NextDueDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<RecurringInvoice> CreateAsync(RecurringInvoice invoice, CancellationToken cancellationToken = default)
    {
        await context.RecurringInvoices.AddAsync(invoice, cancellationToken);
        return invoice;
    }

    public Task UpdateAsync(RecurringInvoice invoice, CancellationToken cancellationToken = default)
    {
        context.RecurringInvoices.Update(invoice);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
    {
        var invoice = await context.RecurringInvoices
            .FirstOrDefaultAsync(r => r.Id == id && r.BusinessId == businessId, cancellationToken);
        if (invoice is not null)
            context.RecurringInvoices.Remove(invoice);
    }
}
