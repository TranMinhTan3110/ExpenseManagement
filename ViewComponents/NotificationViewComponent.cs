// Ví dụ: ViewComponents/NotificationViewComponent.cs
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.ViewComponents
{
    public class NotificationViewComponent : ViewComponent
    {
        private readonly INotificationService _notificationService;

        public NotificationViewComponent(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            // Lấy ID của user đang đăng nhập
            var userId = HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                // Nếu chưa đăng nhập, trả về view rỗng
                return View(new List<Models.Entities.Notification>());
            }

            var notifications = await _notificationService.GetUnreadNotificationsAsync(userId);
            return View(notifications); // Trả về view Default.cshtml
        }
    }
}