using System;

namespace FinanceKite.Infrastructure.Persistence.Configurations;

using FinanceKite.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Amount)
            .HasPrecision(18, 2); // 18 total digits, 2 decimal places

        builder.Property(i => i.Status)
            .HasConversion<string>() // Store enum as string in DB, not integer
            .HasMaxLength(20);

        builder.Property(i => i.DocumentUrl)
            .HasMaxLength(2048);

        builder.Property(i => i.Notes)
            .HasMaxLength(1000);

        // Ignore computed properties — EF Core must not try to map these to columns
        builder.Ignore(i => i.DaysUntilDue);
        builder.Ignore(i => i.DaysOverdue);
        builder.Ignore(i => i.IsDueSoon);

        // Unique invoice number per business
        builder.HasIndex(i => new { i.BusinessId, i.InvoiceNumber }).IsUnique();

        // Frequently queried by business + status for dashboard
        builder.HasIndex(i => new { i.BusinessId, i.Status });
    }
}

/*
📘 Why HasPrecision(18, 2) for money? Never store money as a plain decimal without precision. 
HasPrecision(18, 2) tells PostgreSQL to use numeric(18,2)
exactly 2 decimal places, no floating-point rounding errors. Financial data demands exactness.

📘 Why HasConversion<string>() for the Status enum? 
By default EF Core stores enums as integers (0, 1, 2...). 
If you ever reorder the enum values, all your existing data becomes wrong silently. 
Storing as a string ("Pending", "Paid") is self-documenting and safe against refactoring.

📘 Why builder.Ignore()? The computed properties DaysUntilDue, DaysOverdue, and IsDueSoon are calculated in C# at runtime. 
They have no backing column in the database. Without Ignore(), EF Core would try to map them and throw an error.
*/
