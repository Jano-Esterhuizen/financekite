using System;

namespace FinanceKite.Application.Features.RecurringInvoices;

using FinanceKite.Domain.Entities;

public static class RecurringInvoiceMappings
{
    public static RecurringInvoiceResponse ToResponse(this RecurringInvoice invoice) =>
        new(
            invoice.Id,
            invoice.BusinessId,
            invoice.ClientId,
            invoice.Client?.Name,
            invoice.Description,
            invoice.Amount,
            invoice.BillingCycle,
            invoice.StartDate,
            invoice.NextDueDate,
            invoice.IsActive,
            invoice.DaysUntilNextDue,
            invoice.Notes,
            invoice.CreatedAt
        );
}
