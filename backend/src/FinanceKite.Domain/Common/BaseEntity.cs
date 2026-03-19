using System;

namespace FinanceKite.Domain.Common;

//Why abstract? You should never create a raw BaseEntity on its own
//it only makes sense as a base for a real entity like Business or Client. Marking it abstract enforces this at compile time.

public abstract class BaseEntity
{
    public Guid Id { get; init; } = Guid.NewGuid(); //Why init instead of set? init means the property can only be set during object construction
}
