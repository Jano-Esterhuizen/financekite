namespace FinanceKite.Application.Features.Invoices;

using FinanceKite.Domain.Entities;

public static class InvoiceMappings
{
    public static InvoiceResponse ToResponse(this Invoice invoice) =>
        new(
            invoice.Id,
            invoice.BusinessId,
            invoice.ClientId,
            invoice.Client?.Name ?? string.Empty,
            invoice.InvoiceNumber,
            invoice.Amount,
            invoice.Status,
            invoice.IssuedDate,
            invoice.DueDate,
            invoice.DocumentUrl,
            invoice.Notes,
            invoice.DaysUntilDue,
            invoice.DaysOverdue,
            invoice.IsDueSoon,
            invoice.CreatedAt
        );
}
