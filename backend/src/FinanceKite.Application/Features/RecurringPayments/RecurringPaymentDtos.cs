using System;

namespace FinanceKite.Application.Features.RecurringPayments;

using FinanceKite.Domain.Entities;

public record CreateRecurringPaymentRequest(
    string Description,
    decimal Amount,
    BillingCycle BillingCycle,
    DateTime StartDate,
    DateTime NextDueDate,
    Guid? ClientId,
    string? Notes
);

public record UpdateRecurringPaymentRequest(
    string Description,
    decimal Amount,
    BillingCycle BillingCycle,
    DateTime NextDueDate,
    bool IsActive,
    Guid? ClientId,
    string? Notes
);

public record RecurringPaymentResponse(
    Guid Id,
    Guid BusinessId,
    Guid? ClientId,
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
