using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Application.Common.Models;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class BusinessRepository(ApplicationDbContext context) : IBusinessRepository
{
    public async Task<Business?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await context.Businesses
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Business>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => await context.Businesses
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.Name)
            .ToListAsync(cancellationToken);

    public async Task<Business> CreateAsync(Business business, CancellationToken cancellationToken = default)
    {
        await context.Businesses.AddAsync(business, cancellationToken);
        return business;
    }

    public Task UpdateAsync(Business business, CancellationToken cancellationToken = default)
    {
        context.Businesses.Update(business);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var business = await context.Businesses
            .FindAsync([id], cancellationToken);
        if (business is not null)
            context.Businesses.Remove(business);
    }

    public async Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken cancellationToken = default)
        => await context.Businesses
            .AnyAsync(b => b.Id == id && b.UserId == userId, cancellationToken);

    public async Task<FinancialSummary> GetFinancialSummaryAsync(
    Guid businessId,
    CancellationToken cancellationToken = default)
    {
        // All three aggregations run as separate efficient SQL SUM queries
        // None of these load records into memory — EF Core translates them to SQL

        var totalPaid = await context.Invoices
            .Where(i => i.BusinessId == businessId && i.Status == InvoiceStatus.Paid)
            .SumAsync(i => i.Amount, cancellationToken);

        var totalOutstanding = await context.Invoices
            .Where(i => i.BusinessId == businessId &&
                        (i.Status == InvoiceStatus.Pending ||
                         i.Status == InvoiceStatus.Overdue))
            .SumAsync(i => i.Amount, cancellationToken);

        var totalExpenses = await context.Expenses
            .Where(e => e.BusinessId == businessId)
            .SumAsync(e => e.Amount, cancellationToken);

        return new FinancialSummary
        {
            TotalPaid = totalPaid,
            TotalOutstanding = totalOutstanding,
            TotalExpenses = totalExpenses
        };

        /*
        📘 Why three separate queries instead of one? Each aggregation filters on different conditions
        combining them into one query would require complex SQL that's harder to read and maintain. 
        Three simple SUM queries are each translated to a single SQL statement, run in milliseconds, and are perfectly readable. 
        Don't over-optimize until you have a reason to.

        📘 Why SumAsync instead of loading records? SumAsync tells EF Core to push the SUM() calculation to the database. 
        The database returns a single decimal number. 
        If we did invoices.ToListAsync() first and then .Sum(), we'd load potentially thousands of records into memory 
        just to add up their amounts, very wasteful.
        */
    }
}



/*
📘 Why does UpdateAsync return Task.CompletedTask? 
EF Core's change tracker already knows about the entity (it was loaded from the DB in the service layer). 
Calling context.Businesses.Update(business) marks it as modified. 
There's no async work here, but we return Task.CompletedTask to keep the interface consistent
All repository methods are async for uniformity, even if some don't need it.
*/
