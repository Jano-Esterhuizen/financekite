using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ClientConfiguration : IEntityTypeConfiguration<Client>
{
    public void Configure(EntityTypeBuilder<Client> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.CompanyName)
            .HasMaxLength(100);

        builder.Property(c => c.Email)
            .HasMaxLength(254); // RFC 5321 max email length

        builder.Property(c => c.Phone)
            .HasMaxLength(20);

        builder.Property(c => c.Address)
            .HasMaxLength(300);

        // Composite index — we almost always filter clients by business
        builder.HasIndex(c => new { c.BusinessId, c.IsArchived });

        // One Client has many Invoices
        builder.HasMany(c => c.Invoices)
            .WithOne(i => i.Client)
            .HasForeignKey(i => i.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // One Client has many Expenses (optional link)
        builder.HasMany(c => c.Expenses)
            .WithOne(e => e.Client)
            .HasForeignKey(e => e.ClientId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        // One Client has many RecurringPayments (optional link)
        builder.HasMany(c => c.RecurringPayments)
            .WithOne(r => r.Client)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}

/* 
Why DeleteBehavior.Restrict for Invoices? Unlike expenses
you should never silently delete invoices when a client is deleted
invoices are financial records with legal and accounting implications. 
Restrict means the database will refuse to delete a client if they still have invoices. 
You'd need to explicitly handle invoices first (archive them, reassign them, etc.)

Why DeleteBehavior.SetNull for Expenses and RecurringPayments? These have an optional client link. 
If a client is deleted, we don't want to lose the expense or recurring payment records
We just clear the client reference (ClientId becomes null). The record survives, just unlinked.
*/