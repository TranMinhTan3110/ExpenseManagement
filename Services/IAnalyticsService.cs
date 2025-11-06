using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface IAnalyticsService
    {
        Task<ExpenseAnalyticsViewModel> GetExpenseAnalyticsAsync(
            string userId,
            int? walletId,
            string? month
        );
    }
}