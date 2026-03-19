using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public enum BillingCycle
{
    Monthly,
    Yearly,
    Weekly,
    OneTime
}

public class Subscription : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    public DateTime StartDate { get; set; }
    public DateTime? NextBillingDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    // Navigation property
    public Business Business { get; set; } = null!;
}
