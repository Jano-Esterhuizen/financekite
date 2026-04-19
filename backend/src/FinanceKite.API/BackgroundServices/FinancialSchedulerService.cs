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
                logger.LogError(ex, "Error occurred in Financial Scheduler Service.");
            }

            var intervalHours = configuration.GetValue<double>("Scheduler:IntervalHours", 24);
            await Task.Delay(TimeSpan.FromHours(intervalHours), stoppingToken);
        }
    }

    private async Task RunScheduledTasksAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Running scheduled financial tasks at {Time}.", DateTime.UtcNow);

        using var scope = scopeFactory.CreateScope();

        var invoiceRepository = scope.ServiceProvider.GetRequiredService<IInvoiceRepository>();
        var expenseRepository = scope.ServiceProvider.GetRequiredService<IExpenseRepository>();
        var recurringPaymentRepository = scope.ServiceProvider.GetRequiredService<IRecurringPaymentRepository>();
        var recurringInvoiceRepository = scope.ServiceProvider.GetRequiredService<IRecurringInvoiceRepository>();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        await MarkOverdueInvoicesAsync(invoiceRepository, unitOfWork, cancellationToken);
        await ProcessRecurringPaymentsAsync(recurringPaymentRepository, expenseRepository, unitOfWork, cancellationToken);
        await ProcessRecurringInvoicesAsync(recurringInvoiceRepository, invoiceRepository, unitOfWork, emailService, cancellationToken);
    }

    private async Task MarkOverdueInvoicesAsync(
        IInvoiceRepository invoiceRepository,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken)
    {
        var overdueInvoices = await invoiceRepository.GetPendingOverdueAsync(cancellationToken);

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
        logger.LogInformation("Marked {Count} invoice(s) as overdue.", overdueInvoices.Count);
    }

    private async Task ProcessRecurringPaymentsAsync(
        IRecurringPaymentRepository recurringPaymentRepository,
        IExpenseRepository expenseRepository,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken)
    {
        var duePayments = await recurringPaymentRepository.GetDueAsync(cancellationToken);

        if (!duePayments.Any())
        {
            logger.LogInformation("No recurring payments to process.");
            return;
        }

        foreach (var payment in duePayments)
        {
            var expense = new Expense
            {
                BusinessId = payment.BusinessId,
                Description = payment.Description,
                Amount = payment.Amount,
                Date = DateTime.UtcNow,
                Category = payment.Category,
                Notes = $"Auto-generated from recurring payment: {payment.Description}"
            };

            await expenseRepository.CreateAsync(expense, cancellationToken);

            payment.AdvanceToNextCycle();
            payment.UpdatedAt = DateTime.UtcNow;
            await recurringPaymentRepository.UpdateAsync(payment, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Processed {Count} recurring payment(s) into expenses.", duePayments.Count);
    }

    private async Task ProcessRecurringInvoicesAsync(
        IRecurringInvoiceRepository recurringInvoiceRepository,
        IInvoiceRepository invoiceRepository,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        CancellationToken cancellationToken)
    {
        var dueInvoices = await recurringInvoiceRepository.GetDueAsync(cancellationToken);

        if (!dueInvoices.Any())
        {
            logger.LogInformation("No recurring invoices to process.");
            return;
        }

        foreach (var recurring in dueInvoices)
        {
            var invoiceNumber = $"REC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

            var invoice = new Invoice
            {
                BusinessId = recurring.BusinessId,
                ClientId = recurring.ClientId,
                InvoiceNumber = invoiceNumber,
                Amount = recurring.Amount,
                Status = InvoiceStatus.Pending,
                IssuedDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow,
                Notes = $"Auto-generated from recurring invoice: {recurring.Description}"
            };

            await invoiceRepository.CreateAsync(invoice, cancellationToken);

            if (recurring.Client?.Email is not null)
            {
                await emailService.SendReminderEmailAsync(
                    toEmail: recurring.Client.Email,
                    toName: recurring.Client.Name,
                    businessName: recurring.Business.Name,
                    description: recurring.Description,
                    amount: recurring.Amount,
                    dueDate: recurring.NextDueDate,
                    cancellationToken: cancellationToken);
            }

            recurring.AdvanceToNextCycle();
            recurring.UpdatedAt = DateTime.UtcNow;
            await recurringInvoiceRepository.UpdateAsync(recurring, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Processed {Count} recurring invoice(s) into invoices.", dueInvoices.Count);
    }
}
