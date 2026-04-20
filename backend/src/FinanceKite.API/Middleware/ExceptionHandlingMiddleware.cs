using System;

namespace FinanceKite.API.Middleware;

using System.Net;
using System.Text.Json;
using FinanceKite.Application.Common.Exceptions;
using UnauthorizedAccessException = FinanceKite.Application.Common.Exceptions.UnauthorizedAccessException;

public class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            logger.LogInformation("Validation failed: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
        catch (NotFoundException ex)
        {
            logger.LogInformation("Resource not found: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogInformation("Unauthorized access: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, title, errors) = exception switch
        {
            NotFoundException e => (
                HttpStatusCode.NotFound,
                e.Message,
                (IDictionary<string, string[]>?)null),

            ValidationException e => (
                HttpStatusCode.BadRequest,
                "One or more validation errors occurred.",
                (IDictionary<string, string[]>?)e.Errors),

            UnauthorizedAccessException e => (
                HttpStatusCode.Forbidden,
                e.Message,
                (IDictionary<string, string[]>?)null),

            _ => (
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.",
                (IDictionary<string, string[]>?)null)
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            title,
            errors
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

/*
📘 Why middleware instead of try/catch in controllers? Middleware runs on every request in the pipeline. 
One class handles all exceptions for the entire API — no duplication, no missed cases. 
If you used try/catch in controllers you'd need it in every single method, 
and one forgotten catch would return an ugly unformatted 500 error to the frontend.

📘 Why a switch expression on the exception type? C# pattern matching on types is clean and exhaustive. 
Each custom exception maps to the correct HTTP status code: NotFoundException → 404, ValidationException → 400, UnauthorizedAccessException → 403. 
Anything else falls through to 500.
*/