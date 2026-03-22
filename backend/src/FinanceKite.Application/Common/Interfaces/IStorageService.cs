using System;

namespace FinanceKite.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder,
        CancellationToken cancellationToken = default);

    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);

    Task<string> GetSignedUrlAsync(
        string filePath,
        int expiresInSeconds = 3600,
        CancellationToken cancellationToken = default);
}
