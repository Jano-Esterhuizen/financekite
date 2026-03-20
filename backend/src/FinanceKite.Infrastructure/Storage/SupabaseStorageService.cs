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

        var filePath = $"{folder}/{Guid.NewGuid()}_{fileName}";

        await supabaseClient.Storage
            .From(_bucketName)
            .Upload(bytes, filePath, new Supabase.Storage.FileOptions
            {
                ContentType = contentType,
                Upsert = false
            });

        return supabaseClient.Storage
            .From(_bucketName)
            .GetPublicUrl(filePath);
    }

    public async Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        // Extract path from the full URL
        var uri = new Uri(fileUrl);
        var path = uri.AbsolutePath
            .Replace($"/storage/v1/object/public/{_bucketName}/", string.Empty);

        await supabaseClient.Storage
            .From(_bucketName)
            .Remove([path]);
    }
}
