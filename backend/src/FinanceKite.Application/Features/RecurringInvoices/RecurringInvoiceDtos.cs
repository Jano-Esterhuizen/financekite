using System;

namespace FinanceKite.Application.Features.RecurringInvoices;

using FinanceKite.Domain.Entities;

public record CreateRecurringInvoiceRequest(
    string Description,
    decimal Amount,
    BillingCycle BillingCycle,
    DateTime StartDate,
    DateTime NextDueDate,
    Guid ClientId,
    string? Notes
);

public record UpdateRecurringInvoiceRequest(
    string Description,
    decimal Amount,
    BillingCycle BillingCycle,
    DateTime NextDueDate,
    bool IsActive,
    Guid ClientId,
    string? Notes
);

public record RecurringInvoiceResponse(
    Guid Id,
    Guid BusinessId,
    Guid ClientId,
    string? ClientName,
    string Description,
    decimal Amount,
    BillingCycle BillingCycle,
    DateTime StartDate,
    DateTime NextDueDate,
    bool IsActive,
    int DaysUntilNextDue,
    string? Notes,
    DateTime CreatedAt
);
