// Ví dụ: Services/NotificationService.cs
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;

namespace QuanLyChiTieu_WebApp.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        // HÀM TẠO THÔNG BÁO
        public async Task CreateNotificationAsync(string userId, string message, string url = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Message = message,
                Url = url,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        // HÀM LẤY THÔNG BÁO CHƯA ĐỌC
        public async Task<List<Notification>> GetUnreadNotificationsAsync(string userId, int take = 5)
        {
            return await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .Take(take) // Chỉ lấy 5 thông báo mới nhất
                .ToListAsync();
        }
    }
}