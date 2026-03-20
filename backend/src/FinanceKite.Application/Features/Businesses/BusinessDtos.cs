using System;

namespace FinanceKite.Application.Features.Businesses;

public record CreateBusinessRequest(
    string Name,
    string? Description,
    string CurrencyCode
);

public record UpdateBusinessRequest(
    string Name,
    string? Description,
    string CurrencyCode
);

public record BusinessResponse(
    Guid Id,
    string Name,
    string? Description,
    string? LogoUrl,
    string CurrencyCode,
    bool IsArchived,
    DateTime CreatedAt
);
