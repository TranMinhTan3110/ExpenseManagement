using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyChiTieu_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAmountConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_GoalDeposit_Amount_Positive",
                table: "GoalDeposits");

            //migrationBuilder.AddColumn<bool>(
            //    name: "IsRecurring",
            //    table: "Budgets",
            //    type: "bit",
            //    nullable: false,
            //    defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsRecurring",
                table: "Budgets");

            migrationBuilder.AddCheckConstraint(
                name: "CK_GoalDeposit_Amount_Positive",
                table: "GoalDeposits",
                sql: "Amount > 0");
        }
    }
}
