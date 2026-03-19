using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public class Business : AuditableEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
    public string CurrencyCode { get; set; } = "ZAR"; // Default to ZAR since target market is ZA
    public bool IsArchived { get; set; } = false;

    // Navigation properties
    public ICollection<Client> Clients { get; set; } = [];
    public ICollection<Expense> Expenses { get; set; } = [];
    public ICollection<RecurringPayment> RecurringPayments { get; set; } = [];

    //Why ICollection and not List? ICollection is an interface
    //it describes what you can do (add, remove, count) without locking you into a specific implementation
}
