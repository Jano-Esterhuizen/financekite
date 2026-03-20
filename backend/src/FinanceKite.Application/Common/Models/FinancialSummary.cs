using System;

namespace FinanceKite.Application.Common.Models;

public class FinancialSummary
{
    public decimal TotalPaid { get; init; }
    public decimal TotalOutstanding { get; init; }
    public decimal TotalExpenses { get; init; }
    public decimal FutureProfit => (TotalPaid + TotalOutstanding) - TotalExpenses;
}
