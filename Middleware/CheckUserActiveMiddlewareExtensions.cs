using Microsoft.AspNetCore.Builder;

namespace QuanLyChiTieu_WebApp.Middleware
{
    public static class CheckUserActiveMiddlewareExtensions
    {
        public static IApplicationBuilder UseCheckUserActive(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CheckUserActiveMiddleware>();
        }
    }
}
