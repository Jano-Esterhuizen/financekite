using System;

namespace FinanceKite.Application.Features.Invoices;

using FluentValidation;

public class CreateInvoiceRequestValidator : AbstractValidator<CreateInvoiceRequest>
{
    public CreateInvoiceRequestValidator()
    {
        RuleFor(x => x.ClientId)
            .NotEmpty().WithMessage("Client is required.");

        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required.")
            .MaximumLength(50).WithMessage("Invoice number cannot exceed 50 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Invoice amount must be greater than zero.");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(x => x.IssuedDate)
            .WithMessage("Due date must be on or after the issue date.");
    }
}

public class UpdateInvoiceRequestValidator : AbstractValidator<UpdateInvoiceRequest>
{
    public UpdateInvoiceRequestValidator()
    {
        RuleFor(x => x.InvoiceNumber)
            .NotEmpty().WithMessage("Invoice number is required.")
            .MaximumLength(50).WithMessage("Invoice number cannot exceed 50 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Invoice amount must be greater than zero.");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(x => x.IssuedDate)
            .WithMessage("Due date must be on or after the issue date.");
    }
}
