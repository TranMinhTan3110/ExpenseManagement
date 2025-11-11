using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyChiTieu_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddIsRecurringToBudgets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           migrationBuilder.AddColumn<bool>(
           name: "IsRecurring",
           table: "Budgets",
           type: "bit",
           nullable: false,
           defaultValue: false);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
            name: "IsRecurring",
            table: "Budgets");

        }
    }
}
