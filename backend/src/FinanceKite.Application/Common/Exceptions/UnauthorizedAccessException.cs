using System;

namespace FinanceKite.Application.Common.Exceptions;

public class UnauthorizedAccessException : Exception
{
    public UnauthorizedAccessException()
        : base("You do not have permission to access this resource.")
    {
    }
}
