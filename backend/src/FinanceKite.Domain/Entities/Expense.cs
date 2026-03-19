using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public enum ExpenseCategory
{
    Hosting,
    Domain,
    Tools,
    Service,
    Other     // Safety fallback — always good to have
}

public class Expense : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public Guid? ClientId { get; set; }        // Optional: link expense to a specific client
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public string? ProofOfPaymentUrl { get; set; }  // Supabase Storage URL for receipt PDF
    public string? Notes { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public Client? Client { get; set; }        // Nullable — expense may not be client-specific
}
