using System;

namespace FinanceKite.API.BackgroundServices;

using FinanceKite.Application.Common.Interfaces;
using FinanceKite.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class FinancialSchedulerService(
    IServiceScopeFactory scopeFactory,
    ILogger<FinancialSchedulerService> logger,
    IConfiguration configuration) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Financial Scheduler Service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunScheduledTasksAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                // Never let an unhandled exception kill the background service
                logger.LogError(ex, "Error occurred in Financial Scheduler Service.");
            }

            // Wait until next run — default 24 hours
            // This can handle both 24 and 0.001
            var intervalHours = configuration.GetValue<double>("Scheduler:IntervalHours", 24);
            await Task.Delay(TimeSpan.FromHours(intervalHours), stoppingToken);
        }
    }

    private async Task RunScheduledTasksAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Running scheduled financial tasks at {Time}.", DateTime.UtcNow);

        // Background services must create their own scope to use scoped services
        // (like repositories which depend on DbContext)
        using var scope = scopeFactory.CreateScope();

        var invoiceRepository = scope.ServiceProvider
            .GetRequiredService<IInvoiceRepository>();
        var recurringPaymentRepository = scope.ServiceProvider
            .GetRequiredService<IRecurringPaymentRepository>();
        var unitOfWork = scope.ServiceProvider
            .GetRequiredService<IUnitOfWork>();
        var emailService = scope.ServiceProvider
            .GetRequiredService<IEmailService>();

        await MarkOverdueInvoicesAsync(invoiceRepository, unitOfWork, cancellationToken);
        await SendPaymentRemindersAsync(recurringPaymentRepository, unitOfWork, emailService, cancellationToken);
    }

    private async Task MarkOverdueInvoicesAsync(
        IInvoiceRepository invoiceRepository,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken)
    {
        var overdueInvoices = await invoiceRepository
            .GetPendingOverdueAsync(cancellationToken);

        if (!overdueInvoices.Any())
        {
            logger.LogInformation("No invoices to mark as overdue.");
            return;
        }

        foreach (var invoice in overdueInvoices)
        {
            invoice.Status = InvoiceStatus.Overdue;
            invoice.UpdatedAt = DateTime.UtcNow;
            await invoiceRepository.UpdateAsync(invoice, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Marked {Count} invoice(s) as overdue.", overdueInvoices.Count);
    }

    private async Task SendPaymentRemindersAsync(
        IRecurringPaymentRepository recurringPaymentRepository,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        CancellationToken cancellationToken)
    {
        var reminderDaysAhead = configuration.GetValue<int>("Scheduler:ReminderDaysAhead", 7);

        var duePayments = await recurringPaymentRepository
            .GetDueForReminderAsync(reminderDaysAhead, cancellationToken);

        if (!duePayments.Any())
        {
            logger.LogInformation("No payment reminders to send.");
            return;
        }

        foreach (var payment in duePayments)
        {
            // Only send email if the client has an email address
            if (payment.Client?.Email is not null)
            {
                await emailService.SendReminderEmailAsync(
                    toEmail: payment.Client.Email,
                    toName: payment.Client.Name,
                    businessName: payment.Business.Name,
                    description: payment.Description,
                    amount: payment.Amount,
                    dueDate: payment.NextDueDate,
                    cancellationToken: cancellationToken);
            }

            // Advance to next billing cycle
            payment.AdvanceToNextCycle();
            payment.UpdatedAt = DateTime.UtcNow;
            await recurringPaymentRepository.UpdateAsync(payment, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Processed {Count} payment reminder(s).", duePayments.Count);
    }
}

/*
📘 Why IServiceScopeFactory instead of injecting repositories directly? Background services are registered as singletons
They live for the entire app lifetime. But repositories and DbContext are scoped — they're designed to live for one request only. 
You can't inject a scoped service into a singleton directly — it would cause a lifetime mismatch error. 
Instead, we use IServiceScopeFactory to manually create a new scope each time the scheduled task runs
getting fresh instances of all scoped services. This is the standard .NET pattern for background services.
*/
