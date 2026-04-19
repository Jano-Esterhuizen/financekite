using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RecurringInvoiceConfiguration : IEntityTypeConfiguration<RecurringInvoice>
{
    public void Configure(EntityTypeBuilder<RecurringInvoice> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Description)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(r => r.Amount)
            .HasPrecision(18, 2);

        builder.Property(r => r.BillingCycle)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(r => r.Notes)
            .HasMaxLength(1000);

        builder.Ignore(r => r.DaysUntilNextDue);

        builder.HasIndex(r => new { r.IsActive, r.NextDueDate });

        builder.HasOne(r => r.Client)
            .WithMany(c => c.RecurringInvoices)
            .HasForeignKey(r => r.ClientId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
