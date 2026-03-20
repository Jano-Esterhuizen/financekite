using System;

namespace FinanceKite.Application.Features.Invoices;

using FinanceKite.Domain.Entities;

public record CreateInvoiceRequest(
    Guid ClientId,
    string InvoiceNumber,
    decimal Amount,
    DateTime IssuedDate,
    DateTime DueDate,
    string? Notes
);

public record UpdateInvoiceRequest(
    string InvoiceNumber,
    decimal Amount,
    InvoiceStatus Status,
    DateTime IssuedDate,
    DateTime DueDate,
    string? Notes
);

public record InvoiceResponse(
    Guid Id,
    Guid BusinessId,
    Guid ClientId,
    string ClientName,
    string InvoiceNumber,
    decimal Amount,
    InvoiceStatus Status,
    DateTime IssuedDate,
    DateTime DueDate,
    string? DocumentUrl,
    string? Notes,
    int DaysUntilDue,
    int DaysOverdue,
    bool IsDueSoon,
    DateTime CreatedAt
);
