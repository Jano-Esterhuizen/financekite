using System;

namespace FinanceKite.Infrastructure.Persistence.Repositories;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ClientRepository(ApplicationDbContext context) : IClientRepository
{
    public async Task<Client?> GetByIdAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Clients
            .Include(c => c.Invoices)
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId, cancellationToken);

    public async Task<IReadOnlyList<Client>> GetAllByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        => await context.Clients
            .Include(c => c.Invoices)
            .Where(c => c.BusinessId == businessId)
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

    public async Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default)
    {
        await context.Clients.AddAsync(client, cancellationToken);
        return client;
    }

    public Task UpdateAsync(Client client, CancellationToken cancellationToken = default)
    {
        context.Clients.Update(client);
        return Task.CompletedTask;
    }

    public async Task DeleteAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
    {
        var client = await context.Clients
            .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId, cancellationToken);
        if (client is not null)
            context.Clients.Remove(client);
    }

    public async Task<bool> ExistsAsync(Guid id, Guid businessId, CancellationToken cancellationToken = default)
        => await context.Clients
            .AnyAsync(c => c.Id == id && c.BusinessId == businessId, cancellationToken);
}
