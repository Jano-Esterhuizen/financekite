using System;

namespace FinanceKite.Domain.Entities;

using FinanceKite.Domain.Common;

public class InvoiceLineItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    // Navigation property
    public Invoice Invoice { get; set; } = null!;
}
