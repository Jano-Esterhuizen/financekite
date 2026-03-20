using System;

namespace FinanceKite.Application;

using System.Reflection;
using FinanceKite.Application.Features.Businesses;
using FinanceKite.Application.Features.Clients;
using FinanceKite.Application.Features.Expenses;
using FinanceKite.Application.Features.Invoices;
using FinanceKite.Application.Features.RecurringPayments;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register all FluentValidation validators in this assembly automatically
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Register services
        services.AddScoped<BusinessService>();
        services.AddScoped<ClientService>();
        services.AddScoped<InvoiceService>();
        services.AddScoped<ExpenseService>();
        services.AddScoped<RecurringPaymentService>();

        return services;
    }
}
