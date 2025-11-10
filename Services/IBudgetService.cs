using QuanLyChiTieu_WebApp.ViewModels;
namespace QuanLyChiTieu_WebApp.Services
{
    public interface IBudgetService
    {
        Task<IEnumerable<BudgetViewModel>> GetBudgetsByUserAsync(string userId);

    }
}
