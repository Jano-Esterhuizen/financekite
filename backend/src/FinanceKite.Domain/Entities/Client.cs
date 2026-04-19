using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public class Client : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Email { get; set; }

    // Stored as plain string — ZAR formatting (+27 XX XXX XXXX) is a frontend concern
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsArchived { get; set; } = false;

    // Navigation properties
    public Business Business { get; set; } = null!;
    public ICollection<Invoice> Invoices { get; set; } = [];
    public ICollection<Expense> Expenses { get; set; } = [];        // For client-linked expenses
    public ICollection<RecurringInvoice> RecurringInvoices { get; set; } = [];
}
