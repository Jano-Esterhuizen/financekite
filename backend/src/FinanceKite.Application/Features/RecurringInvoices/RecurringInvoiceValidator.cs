using System;

namespace FinanceKite.Application.Features.RecurringInvoices;

using FluentValidation;

public class CreateRecurringInvoiceRequestValidator : AbstractValidator<CreateRecurringInvoiceRequest>
{
    public CreateRecurringInvoiceRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.NextDueDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Next due date must be on or after the start date.");

        RuleFor(x => x.ClientId)
            .NotEmpty().WithMessage("A client is required for recurring invoices.");
    }
}

public class UpdateRecurringInvoiceRequestValidator : AbstractValidator<UpdateRecurringInvoiceRequest>
{
    public UpdateRecurringInvoiceRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.ClientId)
            .NotEmpty().WithMessage("A client is required for recurring invoices.");
    }
}
