using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(b => b.Description)
            .HasMaxLength(500);

        builder.Property(b => b.LogoUrl)
            .HasMaxLength(2048);

        // Index on UserId — we query businesses by user very frequently
        builder.HasIndex(b => b.UserId);

        // One Business has many Clients
        builder.HasMany(b => b.Clients)
            .WithOne(c => c.Business)
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // One Business has many Expenses
        builder.HasMany(b => b.Expenses)
            .WithOne(e => e.Business)
            .HasForeignKey(e => e.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);

        // One Business has many RecurringPayments
        builder.HasMany(b => b.RecurringPayments)
            .WithOne(r => r.Business)
            .HasForeignKey(r => r.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/* Why DeleteBehavior.Cascade? When a Business is deleted, 
all its related Clients, Expenses, and RecurringPayments should be deleted too
it makes no sense to have orphaned records. Cascade delete handles this automatically at the database level
*/