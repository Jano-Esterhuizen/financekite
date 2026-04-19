using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public class RecurringInvoice : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public Guid ClientId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    public DateTime StartDate { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public Client Client { get; set; } = null!;

    public int DaysUntilNextDue => Math.Max(0, (NextDueDate.Date - DateTime.UtcNow.Date).Days);

    public void AdvanceToNextCycle()
    {
        NextDueDate = BillingCycle switch
        {
            BillingCycle.Weekly  => NextDueDate.AddDays(7),
            BillingCycle.Monthly => NextDueDate.AddMonths(1),
            BillingCycle.Yearly  => NextDueDate.AddYears(1),
            _ => throw new InvalidOperationException($"Unknown billing cycle: {BillingCycle}")
        };
    }
}
