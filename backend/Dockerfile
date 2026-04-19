# ── Build Stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build
WORKDIR /src

# Copy solution and project files first (NuGet restore layer caching)
COPY FinanceKite.slnx ./
COPY src/FinanceKite.Domain/FinanceKite.Domain.csproj src/FinanceKite.Domain/
COPY src/FinanceKite.Application/FinanceKite.Application.csproj src/FinanceKite.Application/
COPY src/FinanceKite.Infrastructure/FinanceKite.Infrastructure.csproj src/FinanceKite.Infrastructure/
COPY src/FinanceKite.API/FinanceKite.API.csproj src/FinanceKite.API/

RUN dotnet restore FinanceKite.slnx

# Copy full source and publish
COPY . .
RUN dotnet publish src/FinanceKite.API/FinanceKite.API.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Runtime Stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0-bookworm-slim AS runtime
WORKDIR /app

# Memory-optimized settings for Render's 512MB limit
ENV DOTNET_gcServer=0 \
    DOTNET_GCHeapHardLimit=0xC800000 \
    DOTNET_GCConserveMemory=9 \
    DOTNET_EnableDiagnostics=0 \
    ASPNETCORE_ENVIRONMENT=Production \
    PORT=10000

COPY --from=build /app/publish .

EXPOSE ${PORT}

# Shell form so $PORT expands at runtime (Render sets this)
ENTRYPOINT ["sh", "-c", "dotnet FinanceKite.API.dll --urls http://+:${PORT}"]
