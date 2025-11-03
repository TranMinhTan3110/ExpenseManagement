using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuanLyChiTieu_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Update_Category_Add_IconColor_Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Color",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Icon",
                table: "Categories");

            migrationBuilder.AddColumn<int>(
                name: "ColorID",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IconID",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Colors",
                columns: table => new
                {
                    ColorID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ColorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HexCode = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colors", x => x.ColorID);
                });

            migrationBuilder.CreateTable(
                name: "Icons",
                columns: table => new
                {
                    IconID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IconName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IconClass = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Icons", x => x.IconID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ColorID",
                table: "Categories",
                column: "ColorID");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_IconID",
                table: "Categories",
                column: "IconID");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Colors_ColorID",
                table: "Categories",
                column: "ColorID",
                principalTable: "Colors",
                principalColumn: "ColorID");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Icons_IconID",
                table: "Categories",
                column: "IconID",
                principalTable: "Icons",
                principalColumn: "IconID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Colors_ColorID",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Icons_IconID",
                table: "Categories");

            migrationBuilder.DropTable(
                name: "Colors");

            migrationBuilder.DropTable(
                name: "Icons");

            migrationBuilder.DropIndex(
                name: "IX_Categories_ColorID",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_IconID",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "ColorID",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IconID",
                table: "Categories");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "Categories",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "Categories",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }
    }
}
