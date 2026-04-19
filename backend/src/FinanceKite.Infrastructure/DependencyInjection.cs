using System;

namespace FinanceKite.Infrastructure;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Infrastructure.Email;
using FinanceKite.Infrastructure.Persistence;
using FinanceKite.Infrastructure.Persistence.Repositories;
using FinanceKite.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using Supabase;
using Resend;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // EF Core with PostgreSQL
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(
                    typeof(ApplicationDbContext).Assembly.FullName)));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped<IBusinessRepository, BusinessRepository>();
        services.AddScoped<IClientRepository, ClientRepository>();
        services.AddScoped<IInvoiceRepository, InvoiceRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IRecurringPaymentRepository, RecurringPaymentRepository>();
        services.AddScoped<IRecurringInvoiceRepository, RecurringInvoiceRepository>();

        // Resend email client
        services.AddOptions();
        services.AddHttpClient<ResendClient>();
        services.Configure<ResendClientOptions>(o =>
        {
            o.ApiToken = configuration["Resend:ApiKey"] ?? string.Empty;
        });
        services.AddTransient<IResend, ResendClient>();
        services.AddScoped<IEmailService, ResendEmailService>();

        // Supabase client (singleton — one instance for the app lifetime)
        services.AddSingleton(provider =>
        {
            var url = configuration["Supabase:Url"]
                ?? throw new InvalidOperationException("Supabase:Url is not configured.");
            var key = configuration["Supabase:ServiceRoleKey"]
                ?? throw new InvalidOperationException("Supabase:ServiceRoleKey is not configured.");

            var options = new SupabaseOptions { AutoRefreshToken = false };
            var client = new Client(url, key, options);
            client.InitializeAsync().GetAwaiter().GetResult();
            return client;
        });

        // Storage service
        services.AddScoped<IStorageService, SupabaseStorageService>();

        return services;
    }
}

/*
📘 Why Singleton for the Supabase client? Creating a new HTTP client for every request is expensive. 
The Supabase client manages its own connection pool internally and is designed to be shared. 
Singleton means one instance is created and reused for the entire lifetime of the application — correct for HTTP clients.

📘 Why ServiceRoleKey and not the anon key? The anon key is for client-side use with Row Level Security enforced. 
Our backend bypasses Supabase RLS entirely (we enforce tenancy in our own code), 
so we use the ServiceRoleKey which has full admin access to Storage. 
This key must never be exposed to the frontend.
*/