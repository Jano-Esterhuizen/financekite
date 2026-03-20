using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class RecurringPaymentConfiguration : IEntityTypeConfiguration<RecurringPayment>
{
    public void Configure(EntityTypeBuilder<RecurringPayment> builder)
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

        // Ignore computed property
        builder.Ignore(r => r.DaysUntilNextDue);

        // Background service queries active payments due soon across all businesses
        builder.HasIndex(r => new { r.IsActive, r.NextDueDate });
    }
}