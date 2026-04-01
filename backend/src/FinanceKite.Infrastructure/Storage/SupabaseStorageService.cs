using System;

namespace FinanceKite.Infrastructure.Storage;

using FinanceKite.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Supabase;

public class SupabaseStorageService(Client supabaseClient, IConfiguration configuration) : IStorageService
{
    private readonly string _bucketName =
        configuration["Supabase:StorageBucket"] ?? "financekite-files";

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken = default)
    {
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        var bytes = memoryStream.ToArray();

        var safeFileName = fileName.Replace(' ', '_');
        var filePath = $"{folder}/{Guid.NewGuid()}_{safeFileName}";

        await supabaseClient.Storage
            .From(_bucketName)
            .Upload(bytes, filePath, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = false
            });

        return filePath;
    }

    public async Task<string> GetSignedUrlAsync(
        string filePath,
        int expiresInSeconds = 3600,
        CancellationToken cancellationToken = default)
    {
        // Normalize in case an old full URL was stored
        var cleanPath = ExtractPathFromUrl(filePath);

        var response = await supabaseClient.Storage
            .From(_bucketName)
            .CreateSignedUrl(cleanPath, expiresInSeconds);

        return response
            ?? throw new InvalidOperationException(
                $"Failed to generate signed URL for file: {cleanPath}");

                /*
                📘 Why ExtractPathFromUrl? This is called defensive programming
                making your code handle both old and new data formats gracefully.
                Rather than assuming the stored value is always a clean path, we normalize it every time. 
                This means old records with full URLs and new records with clean paths both work correctly without needing a database migration.
                */
    }

    public async Task DeleteFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        // Normalize in case an old full URL was stored
        var cleanPath = ExtractPathFromUrl(filePath);

        await supabaseClient.Storage
            .From(_bucketName)
            .Remove([cleanPath]);
    }

    /// <summary>
    /// Extracts the storage path from either a full Supabase URL or a plain path.
    /// Full URL: https://xxx.supabase.co/storage/v1/object/public/financekite-files/invoices/biz/file.pdf
    /// Clean path: invoices/biz/file.pdf
    /// </summary>
    private string ExtractPathFromUrl(string filePathOrUrl)
    {
        // If it doesn't look like a URL, assume it's already a clean path
        if (!filePathOrUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            return filePathOrUrl;

        // Strip everything up to and including the bucket name
        var marker = $"/object/public/{_bucketName}/";
        var index = filePathOrUrl.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

        if (index >= 0)
            return filePathOrUrl[(index + marker.Length)..];

        // Also handle signed URL format
        var signedMarker = $"/object/sign/{_bucketName}/";
        var signedIndex = filePathOrUrl.IndexOf(signedMarker, StringComparison.OrdinalIgnoreCase);

        if (signedIndex >= 0)
        {
            var path = filePathOrUrl[(signedIndex + signedMarker.Length)..];
            // Remove query string if present
            var queryIndex = path.IndexOf('?');
            return queryIndex >= 0 ? path[..queryIndex] : path;
        }

        // Fallback — return as-is and let Supabase handle the error
        return filePathOrUrl;
    }
}
