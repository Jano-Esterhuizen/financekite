using System;

namespace FinanceKite.Infrastructure.Persistence;

using FinanceKite.Application.Common.Interfaces;

public class UnitOfWork(ApplicationDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => context.SaveChangesAsync(cancellationToken);
}
