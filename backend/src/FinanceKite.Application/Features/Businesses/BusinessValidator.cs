using System;

namespace FinanceKite.Application.Features.Businesses;

using FluentValidation;

public class CreateBusinessRequestValidator : AbstractValidator<CreateBusinessRequest>
{
    public CreateBusinessRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Business name is required.")
            .MaximumLength(100).WithMessage("Business name cannot exceed 100 characters.");

        RuleFor(x => x.CurrencyCode)
            .NotEmpty().WithMessage("Currency code is required.")
            .Length(3).WithMessage("Currency code must be exactly 3 characters (e.g. ZAR, USD).");
    }
}

public class UpdateBusinessRequestValidator : AbstractValidator<UpdateBusinessRequest>
{
    public UpdateBusinessRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Business name is required.")
            .MaximumLength(100).WithMessage("Business name cannot exceed 100 characters.");

        RuleFor(x => x.CurrencyCode)
            .NotEmpty().WithMessage("Currency code is required.")
            .Length(3).WithMessage("Currency code must be exactly 3 characters (e.g. ZAR, USD).");
    }
}
