using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface IAnalyticsService
    {
        /// <summary>
        /// Lấy thống kê chi tiêu theo ví và tháng
        /// </summary>
        /// <param name="userId">ID của user</param>
        /// <param name="walletId">ID ví (nullable - nếu null thì lấy tất cả ví)</param>
        /// <param name="month">Tháng cần lấy (format: "yyyy-MM")</param>
        /// <returns>ExpenseAnalyticsViewModel</returns>
        Task<ExpenseAnalyticsViewModel> GetExpenseAnalyticsAsync(
            string userId,
            int? walletId,
            string? month
        );

        Task<IncomeAnalyticsViewModel> GetIncomeAnalyticsAsync(
            string userId,
            int? walletId,
            string? month
        );
    }
}