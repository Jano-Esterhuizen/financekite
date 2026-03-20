using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class InvoiceRepository(ApplicationDbContext context) : IInvoiceRepository
{
    public async Task<Invoice?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Invoices
            .Include(i => i.Client)
            .FirstOrDefaultAsync(i => i.Id == id && i.BusinessId == businessId, cancellationToken);

    public async Task<IReadOnlyList<Invoice>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.Invoices
            .Include(i => i.Client)
            .Where(i => i.BusinessId == businessId)
            .OrderByDescending(i => i.IssuedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Invoice>> GetAllByClientIdAsync(Guid clientId, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Invoices
            .Include(i => i.Client)
            .Where(i => i.ClientId == clientId && i.BusinessId == businessId)
            .OrderByDescending(i => i.IssuedDate)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Invoice>> GetOverdueAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.Invoices
            .Include(i => i.Client)
            .Where(i => i.BusinessId == businessId && i.Status == InvoiceStatus.Overdue)
            .OrderBy(i => i.DueDate)
            .ToListAsync(cancellationToken);

    public async Task<Invoice> CreateAsync(Invoice invoice, CancellationToken cancellationToken = default)
    {
        await context.Invoices.AddAsync(invoice, cancellationToken);
        return invoice;
    }

    public Task UpdateAsync(Invoice invoice, CancellationToken cancellationToken = default)
    {
        context.Invoices.Update(invoice);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
    {
        var invoice = await context.Invoices
            .FirstOrDefaultAsync(i => i.Id == id && i.BusinessId == businessId, cancellationToken);
        if (invoice is not null)
            context.Invoices.Remove(invoice);
    }
}
