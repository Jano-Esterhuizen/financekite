using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public enum InvoiceStatus
{
    Pending,
    Paid,
    Overdue,
    Loss      // Written-off / bad debt
}

public class Invoice : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public Guid ClientId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public DateTime IssuedDate { get; set; }
    public DateTime DueDate { get; set; }
    public string? DocumentUrl { get; set; }   // Supabase Storage URL for PDF
    public string? Notes { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public Client Client { get; set; } = null!;

    // --- Computed properties (never stored in the database) ---

    // Positive = days remaining, only meaningful when not yet due
    public int DaysUntilDue => Status == InvoiceStatus.Pending
        ? Math.Max(0, (DueDate.Date - DateTime.UtcNow.Date).Days)
        : 0;

    // Positive = days past due, only meaningful when overdue
    public int DaysOverdue => Status == InvoiceStatus.Overdue
        ? Math.Max(0, (DateTime.UtcNow.Date - DueDate.Date).Days)
        : 0;

    // A single property the UI can use to display the right badge
    public bool IsDueSoon => Status == InvoiceStatus.Pending && DaysUntilDue <= 7;
}
