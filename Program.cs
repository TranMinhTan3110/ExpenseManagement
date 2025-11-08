using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Services;
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- CẤU HÌNH DỊCH VỤ ---

builder.Services.AddControllersWithViews();

// 1. Đăng ký DbContext (Bạn đã có)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

//// 2. Cấu hình Cookie Authentication
//builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
//    .AddCookie(options =>
//    {
//        options.LoginPath = "/Login/Index"; // Đường dẫn đến trang đăng nhập
//        options.LogoutPath = "/Login/Logout"; // Đường dẫn để đăng xuất
//        options.AccessDeniedPath = "/Home/AccessDenied"; // Đường dẫn khi bị từ chối truy cập
//        options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // Thời gian hết hạn cookie
//        options.SlidingExpiration = true;
//    });

// 3. Đăng ký dịch vụ Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});



// Thêm HttpContextAccessor để có thể truy cập HttpContext từ các service khác
builder.Services.AddHttpContextAccessor();

// 1. Đăng ký MailSettings từ appsettings.json
builder.Services.Configure<MailSettings>(
    builder.Configuration.GetSection("MailSettings")
);
// Đăng ký Service Layer để inject vào Controller
builder.Services.AddScoped<ILoginServices, LoginServices>();

// Đăng ký EmailService
builder.Services.AddScoped<IEmailService, EmailService>();

// Đăng ký GoalsServices
builder.Services.AddScoped<IGoalService, GoalService>();

// Đăng ký SettingsService
builder.Services.AddScoped<ISettingsService, SettingsService>();

// 1. Lấy Client ID và Secret từ appsettings.json
var googleAuthNSection = builder.Configuration.GetSection("Authentication:Google");
var clientId = googleAuthNSection["ClientId"];
var clientSecret = googleAuthNSection["ClientSecret"];

// 2. Cấu hình Dịch vụ Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        // ... (Cấu hình cookie của bạn như cũ)
        options.LoginPath = "/Login/Index";
    })
    .AddGoogle(options => // THÊM GOOGLE TẠI ĐÂY
    {
        options.ClientId = clientId;
        options.ClientSecret = clientSecret;

        // 3. XỬ LÝ SỰ KIỆN: Đây là phần quan trọng nhất
        // Sau khi Google xác thực thành công, sự kiện này sẽ chạy
        options.Events.OnCreatingTicket = async context =>
        {
            // Lấy email và tên từ Google
            var email = context.Principal.FindFirstValue(ClaimTypes.Email);
            var name = context.Principal.FindFirstValue(ClaimTypes.Name);

            if (string.IsNullOrEmpty(email))
            {
                // Không lấy được email thì không cho đăng nhập
                return;
            }

            // Lấy ILoginServices từ hệ thống DI (Dependency Injection)
            var loginService = context.HttpContext.RequestServices
                .GetRequiredService<ILoginServices>();

            // 4. Tìm hoặc Tạo User trong DB 
            // (Chúng ta sẽ tạo hàm này ở bước 4)
            var appUser = await loginService.FindOrCreateExternalUserAsync(email, name);

            // 5. THAY THẾ CLAIMS (QUAN TRỌNG)
            // Xóa các Claim mặc định của Google...
            context.Identity.RemoveClaim(context.Identity.FindFirst(ClaimTypes.NameIdentifier));

            // ...Và thêm các Claim của ứng dụng BẠN
            // Điều này đảm bảo `User.FindFirstValue(ClaimTypes.NameIdentifier)`
            // sẽ trả về UserID TỪ DATABASE của bạn.
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, appUser.UserID),
                new Claim(ClaimTypes.Name, appUser.FullName ?? appUser.Email),
                new Claim(ClaimTypes.Email, appUser.Email),
                new Claim(ClaimTypes.Role, appUser.Role),
                new Claim("AvatarUrl", appUser.AvatarUrl ?? string.Empty)
            };

            context.Identity.AddClaims(claims);
        };
    });
//Đăng ký CategoryService
builder.Services.AddScoped<ICategoryService, CategoryService>();
//Đăng ký WalletService
builder.Services.AddScoped<IWalletService, WalletService>();
//Đăng ký Transaction
builder.Services.AddScoped<ITransactionService, TransactionService>();
// Đăng ký AnalyticsService
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

//Dang ky BudgetService
builder.Services.AddScoped<BudgetService>();


// --- GỌI BUILD() SAU KHI ĐĂNG KÝ XONG ---
var app = builder.Build();


// --- CẤU HÌNH PIPELINE ---

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// 4. Kích hoạt Session
app.UseSession();

// 5. Kích hoạt Authentication và Authorization
// QUAN TRỌNG: UseAuthentication() phải đứng trước UseAuthorization()
app.UseAuthentication();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=Index}/{id?}");

app.MapControllers();
app.Run();