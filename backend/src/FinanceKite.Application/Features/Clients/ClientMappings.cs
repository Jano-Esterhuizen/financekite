using System;

namespace FinanceKite.Application.Features.Clients;

using FinanceKite.Domain.Entities;

public static class ClientMappings
{
    public static ClientResponse ToResponse(this Client client) =>
        new(
            client.Id,
            client.BusinessId,
            client.Name,
            client.CompanyName,
            client.Email,
            client.Phone,
            client.Address,
            client.IsArchived,
            client.CreatedAt
        );
}
