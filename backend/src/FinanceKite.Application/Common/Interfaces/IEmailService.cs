using System;

namespace FinanceKite.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendReminderEmailAsync(
        string toEmail,
        string toName,
        string businessName,
        string description,
        decimal amount,
        DateTime dueDate,
        CancellationToken cancellationToken = default);
}
