using System;

namespace FinanceKite.Application.Features.Expenses;

using FluentValidation;

public class CreateExpenseRequestValidator : AbstractValidator<CreateExpenseRequest>
{
    public CreateExpenseRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Expense amount must be greater than zero.");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Expense date is required.");
    }
}
