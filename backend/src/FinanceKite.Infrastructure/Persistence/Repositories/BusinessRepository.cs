using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
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
}

/*
📘 Why does UpdateAsync return Task.CompletedTask? 
EF Core's change tracker already knows about the entity (it was loaded from the DB in the service layer). 
Calling context.Businesses.Update(business) marks it as modified. 
There's no async work here, but we return Task.CompletedTask to keep the interface consistent
All repository methods are async for uniformity, even if some don't need it.
*/
