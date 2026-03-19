using System;

namespace FinanceKite.Domain.Common;

//Why AuditableEntity separate from BaseEntity? Not every entity needs timestamps
//some simple lookup/reference entities might not. public abstract class AuditableEntity : BaseEntity

public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
