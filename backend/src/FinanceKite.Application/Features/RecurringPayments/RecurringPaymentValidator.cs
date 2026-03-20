using System;

namespace FinanceKite.Application.Features.RecurringPayments;

using FluentValidation;

public class CreateRecurringPaymentRequestValidator : AbstractValidator<CreateRecurringPaymentRequest>
{
    public CreateRecurringPaymentRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");

        RuleFor(x => x.NextDueDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .WithMessage("Next due date must be on or after the start date.");
    }
}

public class UpdateRecurringPaymentRequestValidator : AbstractValidator<UpdateRecurringPaymentRequest>
{
    public UpdateRecurringPaymentRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than zero.");
    }
}
