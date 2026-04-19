using System;

namespace FinanceKite.Application.Features.RecurringPayments;

using FinanceKite.Domain.Entities;

public static class RecurringPaymentMappings
{
    public static RecurringPaymentResponse ToResponse(this RecurringPayment payment) =>
        new(
            payment.Id,
            payment.BusinessId,
            payment.Description,
            payment.Amount,
            payment.BillingCycle,
            payment.StartDate,
            payment.NextDueDate,
            payment.IsActive,
            payment.Category,
            payment.DaysUntilNextDue,
            payment.Notes,
            payment.CreatedAt
        );
}
