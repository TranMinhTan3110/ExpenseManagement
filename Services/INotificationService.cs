// Ví dụ: Services/INotificationService.cs
using QuanLyChiTieu_WebApp.Models.Entities; // Thêm namespace của model Notification

namespace QuanLyChiTieu_WebApp.Services
{
    public interface INotificationService
    {
        // Dùng để tạo thông báo mới
        Task CreateNotificationAsync(string userId, string message, string url = null);

        // Dùng để lấy thông báo cho ViewComponent
        Task<List<Notification>> GetUnreadNotificationsAsync(string userId, int take = 5);
    }
}