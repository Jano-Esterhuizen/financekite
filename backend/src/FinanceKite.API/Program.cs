using FinanceKite.API.Middleware;
using FinanceKite.Application;
using FinanceKite.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// ── Services ────────────────────────────────────────────────────────────────

// Application & Infrastructure layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<FinanceKite.API.BackgroundServices.FinancialSchedulerService>();

// Controllers
builder.Services.AddControllers();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings instead of integers
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Swagger/OpenAPI for testing endpoints
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS — allow the Next.js frontend to call this API
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// JWT Authentication via Supabase
// Supabase signs its JWTs with your project's JWT secret
// var jwtSecret = builder.Configuration["Supabase:JwtSecret"]
//     ?? throw new InvalidOperationException("Supabase:JwtSecret is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var supabaseUrl = builder.Configuration["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase:Url is not configured.");

        options.Authority = $"{supabaseUrl}/auth/v1";
        options.MetadataAddress = $"{supabaseUrl}/auth/v1/.well-known/openid-configuration";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        options.RequireHttpsMetadata = false;
    });

builder.Services.AddAuthorization();

// ── Pipeline ─────────────────────────────────────────────────────────────────

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handler — must be first in the pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");

// Auth middleware — order matters: Authentication before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }

/*
📘 Why does middleware order matter? ASP.NET Core processes middleware in the exact order you register it. 
ExceptionHandlingMiddleware must be first so it wraps everything else
if it were last, exceptions from authentication middleware would never reach it. 
UseAuthentication() must come before UseAuthorization() — you can't check permissions before you know who the user is. 
This ordering is one of the most common sources of bugs in new .NET projects.

📘 Why ClockSkew = TimeSpan.Zero? By default .NET allows a 5-minute clock skew when validating token expiry
meaning a token expired 4 minutes ago would still be accepted. For a financial app, we want strict expiry. Set it to zero.

📘 Why ValidateIssuer = false? On Supabase's free tier the JWT issuer URL can vary. 
In a production paid tier you'd set ValidIssuer to your Supabase project URL for extra security. 
This is a conscious tradeoff noted for future hardening.
*/

