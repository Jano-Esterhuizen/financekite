using System;

namespace FinanceKite.Application.Features.Clients;

using FinanceKite.Application.Features.Invoices;

public record CreateClientRequest(
    string Name,
    string? CompanyName,
    string? Email,
    string? Phone,
    string? Address
);

public record UpdateClientRequest(
    string Name,
    string? CompanyName,
    string? Email,
    string? Phone,
    string? Address
);

public record ClientResponse(
    Guid Id,
    Guid BusinessId,
    string Name,
    string? CompanyName,
    string? Email,
    string? Phone,
    string? Address,
    bool IsArchived,
    DateTime CreatedAt,
    IReadOnlyList<InvoiceResponse> Invoices
);

public record ClientHealthResponse(
    Guid ClientId,
    string ClientName,
    decimal TotalInvoiced,
    decimal OutstandingBalance
);
