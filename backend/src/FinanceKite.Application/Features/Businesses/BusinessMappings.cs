using System;

namespace FinanceKite.Application.Features.Businesses;

using FinanceKite.Domain.Entities;

public static class BusinessMappings
{
    public static BusinessResponse ToResponse(this Business business) =>
        new(
            business.Id,
            business.Name,
            business.Description,
            business.LogoUrl,
            business.CurrencyCode,
            business.IsArchived,
            business.CreatedAt
        );
}
