using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace QuanLyChiTieu_WebApp.Migrations
{
    /// <inheritdoc />
    public partial class Add_SeedData_For_Icons_And_Colors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.InsertData(
                table: "Colors",
                columns: new[] { "ColorID", "ColorName", "HexCode" },
                values: new object[,]
                {
                    { 1, "Red", "#ef4444" },
                    { 2, "Orange", "#f97316" },
                    { 3, "Amber", "#f59e0b" },
                    { 4, "Yellow", "#eab308" },
                    { 5, "Lime", "#84cc16" },
                    { 6, "Green", "#22c55e" },
                    { 7, "Emerald", "#10b981" },
                    { 8, "Teal", "#14b8a6" },
                    { 9, "Cyan", "#06b6d4" },
                    { 10, "Sky", "#0ea5e9" },
                    { 11, "Blue", "#3b82f6" },
                    { 12, "Indigo", "#6366f1" },
                    { 13, "Violet", "#8b5cf6" },
                    { 14, "Purple", "#a855f7" },
                    { 15, "Fuchsia", "#d946ef" },
                    { 16, "Pink", "#ec4899" },
                    { 17, "Rose", "#f43f5e" },
                    { 18, "Slate", "#64748b" },
                    { 19, "Gray", "#9ca3af" },
                    { 20, "Stone", "#a8a29e" }
                });

            migrationBuilder.InsertData(
                table: "Icons",
                columns: new[] { "IconID", "IconClass", "IconName" },
                values: new object[,]
                {
                    { 1, "fa-solid fa-utensils", "Ăn uống" },
                    { 2, "fa-solid fa-bus-simple", "Đi lại" },
                    { 3, "fa-solid fa-gas-pump", "Xăng xe" },
                    { 4, "fa-solid fa-file-invoice-dollar", "Hóa đơn" },
                    { 5, "fa-solid fa-house-user", "Thuê nhà" },
                    { 6, "fa-solid fa-shirt", "Mua sắm" },
                    { 7, "fa-solid fa-cart-shopping", "Tạp hóa" },
                    { 8, "fa-solid fa-screwdriver-wrench", "Sửa chữa" },
                    { 9, "fa-solid fa-heart-pulse", "Sức khỏe" },
                    { 10, "fa-solid fa-graduation-cap", "Giáo dục" },
                    { 11, "fa-solid fa-film", "Giải trí" },
                    { 12, "fa-solid fa-dumbbell", "Thể thao" },
                    { 13, "fa-solid fa-wand-magic-sparkles", "Làm đẹp" },
                    { 14, "fa-solid fa-mug-hot", "Cà phê" },
                    { 15, "fa-solid fa-plane-departure", "Du lịch" },
                    { 16, "fa-solid fa-palette", "Sở thích" },
                    { 17, "fa-solid fa-gift", "Quà tặng" },
                    { 18, "fa-solid fa-child-reaching", "Con cái" },
                    { 19, "fa-solid fa-paw", "Thú cưng" },
                    { 20, "fa-solid fa-money-bill-wave", "Lương" },
                    { 21, "fa-solid fa-briefcase", "Kinh doanh" },
                    { 22, "fa-solid fa-arrow-trend-up", "Đầu tư" },
                    { 23, "fa-solid fa-piggy-bank", "Tiết kiệm" },
                    { 24, "fa-solid fa-sack-dollar", "Thu nhập phụ" },
                    { 25, "fa-solid fa-shield-halved", "Bảo hiểm" },
                    { 26, "fa-solid fa-building-columns", "Ngân hàng" },
                    { 27, "fa-solid fa-store", "Cửa hàng" },
                    { 28, "fa-solid fa-mobile-screen-button", "Điện thoại" },
                    { 29, "fa-solid fa-wifi", "Internet" },
                    { 30, "fa-solid fa-ellipsis", "Khác" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Colors",
                keyColumn: "ColorID",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Icons",
                keyColumn: "IconID",
                keyValue: 30);

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);
        }
    }
}
