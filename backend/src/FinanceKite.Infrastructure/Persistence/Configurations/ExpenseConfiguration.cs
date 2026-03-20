using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Description)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Amount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Category)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.ProofOfPaymentUrl)
            .HasMaxLength(2048);

        builder.Property(e => e.Notes)
            .HasMaxLength(1000);

        builder.HasIndex(e => new { e.BusinessId, e.Date });
        builder.HasIndex(e => e.ClientId);
    }
}
