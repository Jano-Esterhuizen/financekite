using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public enum BillingCycle
{
    Weekly,
    Monthly,
    Yearly
}

public class RecurringPayment : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public Guid? ClientId { get; set; }         // Optional: which client this is billed to
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public BillingCycle BillingCycle { get; set; } = BillingCycle.Monthly;
    public DateTime StartDate { get; set; }
    public DateTime NextDueDate { get; set; }   // Updated by background service after each cycle
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }

    // Navigation properties
    public Business Business { get; set; } = null!;
    public Client? Client { get; set; }

    // Computed: how many days until the next reminder should fire
    public int DaysUntilNextDue => Math.Max(0, (NextDueDate.Date - DateTime.UtcNow.Date).Days);

    /// <summary>
    /// Call this after a reminder is sent / payment cycle completes.
    /// Advances NextDueDate by one billing cycle.
    /// </summary>
    
    //Why put AdvanceToNextCycle() as a method on the entity? This is a core Domain-Driven Design (DDD) principle called encapsulation. 
    //The logic of "how do I advance a billing cycle?" is a business rule
    //it belongs in the Domain, on the entity itself, not scattered across services or controllers.
    // If this logic ever needs to change, there's exactly one place to change it.
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
