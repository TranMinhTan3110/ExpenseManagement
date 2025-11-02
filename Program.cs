using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models;
using QuanLyChiTieu_WebApp.Services;

var builder = WebApplication.CreateBuilder(args);

// --- CẤU HÌNH DỊCH VỤ ---

builder.Services.AddControllersWithViews();

// 1. Đăng ký DbContext (Bạn đã có)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")),
    ServiceLifetime.Scoped);

// 2. Cấu hình Cookie Authentication
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login/Index"; // Đường dẫn đến trang đăng nhập
        options.LogoutPath = "/Login/Logout"; // Đường dẫn để đăng xuất
        options.AccessDeniedPath = "/Home/AccessDenied"; // Đường dẫn khi bị từ chối truy cập
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // Thời gian hết hạn cookie
        options.SlidingExpiration = true;
    });

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


app.Run();