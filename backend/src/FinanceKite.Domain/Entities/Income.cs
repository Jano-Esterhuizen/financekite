using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public class Income : AuditableEntity
{
    public Guid BusinessId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Source { get; set; }
    public string? Notes { get; set; }

    // Navigation property
    public Business Business { get; set; } = null!;
}
