using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Middleware
{
    public class CheckUserActiveMiddleware
    {
        private readonly RequestDelegate _next;

        public CheckUserActiveMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
        {
            // Chỉ kiểm tra nếu user đã đăng nhập
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (!string.IsNullOrEmpty(userId))
                {
                    // Kiểm tra trạng thái IsActive từ database
                    var user = await dbContext.Users
                        .AsNoTracking()
                        .FirstOrDefaultAsync(u => u.UserID == userId);

                    // Nếu user bị khóa (IsActive = false)
                    if (user == null || user.IsActive == false)
                    {
                        // Đăng xuất ngay lập tức
                        await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                        // Lưu thông báo lỗi vào Session
                        context.Session.SetString("LoginError",
                            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");

                        // Chuyển hướng về trang đăng nhập
                        context.Response.Redirect("/Login/Index");
                        return;
                    }
                }
            }

            // Tiếp tục xử lý request
            await _next(context);
        }
        // Extension method để dễ dàng sử dụng middleware
        //public static class CheckUserActiveMiddlewareExtensions
        //{
        //    public static IApplicationBuilder UseCheckUserActive(this IApplicationBuilder builder)
        //    {
        //        return builder.UseMiddleware<CheckUserActiveMiddleware>();
        //    }
        //}
    }
}