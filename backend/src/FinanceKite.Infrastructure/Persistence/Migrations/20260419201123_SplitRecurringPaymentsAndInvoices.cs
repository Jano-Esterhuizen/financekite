using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanceKite.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SplitRecurringPaymentsAndInvoices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Add Category column first (before dropping anything)
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "RecurringPayments",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Other");

            // 2. Create the RecurringInvoices table
            migrationBuilder.CreateTable(
                name: "RecurringInvoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    BillingCycle = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NextDueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringInvoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringInvoices_Businesses_BusinessId",
                        column: x => x.BusinessId,
                        principalTable: "Businesses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringInvoices_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringInvoices_BusinessId",
                table: "RecurringInvoices",
                column: "BusinessId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringInvoices_ClientId",
                table: "RecurringInvoices",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringInvoices_IsActive_NextDueDate",
                table: "RecurringInvoices",
                columns: new[] { "IsActive", "NextDueDate" });

            // 3. Migrate data: move rows with ClientId to RecurringInvoices
            migrationBuilder.Sql(@"
                INSERT INTO ""RecurringInvoices"" (""Id"", ""BusinessId"", ""ClientId"", ""Description"", ""Amount"", ""BillingCycle"", ""StartDate"", ""NextDueDate"", ""IsActive"", ""Notes"", ""CreatedAt"", ""UpdatedAt"")
                SELECT ""Id"", ""BusinessId"", ""ClientId"", ""Description"", ""Amount"", ""BillingCycle"", ""StartDate"", ""NextDueDate"", ""IsActive"", ""Notes"", ""CreatedAt"", ""UpdatedAt""
                FROM ""RecurringPayments""
                WHERE ""ClientId"" IS NOT NULL;
            ");

            migrationBuilder.Sql(@"
                DELETE FROM ""RecurringPayments"" WHERE ""ClientId"" IS NOT NULL;
            ");

            // 4. Now safe to drop ClientId column
            migrationBuilder.DropForeignKey(
                name: "FK_RecurringPayments_Clients_ClientId",
                table: "RecurringPayments");

            migrationBuilder.DropIndex(
                name: "IX_RecurringPayments_ClientId",
                table: "RecurringPayments");

            migrationBuilder.DropColumn(
                name: "ClientId",
                table: "RecurringPayments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RecurringInvoices");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "RecurringPayments");

            migrationBuilder.AddColumn<Guid>(
                name: "ClientId",
                table: "RecurringPayments",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecurringPayments_ClientId",
                table: "RecurringPayments",
                column: "ClientId");

            migrationBuilder.AddForeignKey(
                name: "FK_RecurringPayments_Clients_ClientId",
                table: "RecurringPayments",
                column: "ClientId",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
