using System;

namespace FinanceKite.Application.Common.Models;

public class FinancialSummary
{
    public decimal TotalPaid { get; init; }
    public decimal TotalOutstanding { get; init; }
    public decimal TotalExpenses { get; init; }
    public decimal FutureProfit => (TotalPaid + TotalOutstanding) - TotalExpenses;
    /*
    📘 Notice futureProfit appears in the response even though we never set it. 
    That's because it's a computed property on FinancialSummary — (TotalPaid + TotalOutstanding) - TotalExpenses. 
    The JSON serializer calls the getter just like any other property, so it appears in the response automatically. 
    Zero extra work needed.
    */
}
