using System;

namespace FinanceKite.Infrastructure.Email;

using FinanceKite.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Resend;

public class ResendEmailService(
    IResend resend,
    IConfiguration configuration,
    ILogger<ResendEmailService> logger) : IEmailService
{
    public async Task SendReminderEmailAsync(
        string toEmail,
        string toName,
        string businessName,
        string description,
        decimal amount,
        DateTime dueDate,
        CancellationToken cancellationToken = default)
    {
        var fromEmail = configuration["Resend:FromEmail"] ?? "onboarding@resend.dev";
        var fromName = configuration["Resend:FromName"] ?? "FinanceKite";

        var message = new EmailMessage
        {
            From = $"{fromName} <{fromEmail}>",
            To = { $"{toName} <{toEmail}>" },
            Subject = $"Payment Reminder: {description} due on {dueDate:dd MMM yyyy}",
            HtmlBody =
                $"<p>Dear <strong>{toName}</strong>,</p>" +
                $"<p>This is a friendly reminder from <strong>{businessName}</strong> that the following payment is due soon:</p>" +
                $"<table style='border-collapse:collapse'>" +
                $"<tr><td style='padding:4px 12px 4px 0'><strong>Description:</strong></td><td>{description}</td></tr>" +
                $"<tr><td style='padding:4px 12px 4px 0'><strong>Amount:</strong></td><td>{amount:C}</td></tr>" +
                $"<tr><td style='padding:4px 12px 4px 0'><strong>Due Date:</strong></td><td>{dueDate:dd MMM yyyy}</td></tr>" +
                $"</table>" +
                $"<p>Please ensure payment is made on time.</p>" +
                $"<p>Regards,<br/><strong>{businessName}</strong></p>",
            TextBody =
                $"Dear {toName},\n\n" +
                $"This is a friendly reminder from {businessName} that the following payment is due soon:\n\n" +
                $"Description: {description}\n" +
                $"Amount: {amount:C}\n" +
                $"Due Date: {dueDate:dd MMM yyyy}\n\n" +
                $"Please ensure payment is made on time.\n\n" +
                $"Regards,\n{businessName}"
        };

        try
        {
            await resend.EmailSendAsync(message, cancellationToken);
            logger.LogInformation(
                "Reminder email sent to {Email} for {Description}.", toEmail, description);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send reminder email to {Email}.", toEmail);
        }
    }
}

/*
📘 Why check for the API key and skip instead of throwing? 
The background service should never crash the entire API because an email failed to send. 
Logging a warning and continuing is the correct behavior
The overdue detection still runs, other reminders still send. This is called graceful degradation.
*/
