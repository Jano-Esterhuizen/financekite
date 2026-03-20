namespace FinanceKite.Infrastructure.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Search upward from current directory to find the API project
        var apiProjectPath = FindApiProjectPath();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiProjectPath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddUserSecrets("f4c627e5-946c-431f-91ab-f646eea0a76f")
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    private static string FindApiProjectPath()
    {
        var current = Directory.GetCurrentDirectory();

        // Walk up the directory tree looking for the API project
        while (current != null)
        {
            var candidate = Path.Combine(current, "src", "FinanceKite.API");
            if (Directory.Exists(candidate))
                return candidate;

            current = Directory.GetParent(current)?.FullName;
        }

        throw new InvalidOperationException(
            "Could not find FinanceKite.API project directory. " +
            "Run the migration command from the backend/ folder.");
    }
}
