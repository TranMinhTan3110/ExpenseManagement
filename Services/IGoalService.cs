using QuanLyChiTieu_WebApp.ViewModels;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface IGoalService
    {
        // Lấy danh sách tất cả mục tiêu của user
        Task<GoalsIndexViewModel> GetUserGoalsAsync(string userId);

        // Lấy chi tiết một mục tiêu cụ thể
        Task<GoalViewModel> GetGoalByIdAsync(int goalId, string userId);

        // Tạo mục tiêu mới
        Task<bool> CreateGoalAsync(CreateGoalViewModel model, string userId);

        // Cập nhật mục tiêu
        Task<bool> UpdateGoalAsync(int goalId, CreateGoalViewModel model, string userId);

        // Xóa mục tiêu
        Task<bool> DeleteGoalAsync(int goalId, string userId);

        // Gửi tiền vào mục tiêu
        Task<bool> DepositToGoalAsync(int goalId, int walletId, decimal amount, string note, string userId);

        // Rút tiền khỏi mục tiêu
        Task<bool> WithdrawFromGoalAsync(int goalId, int walletId, decimal amount, string note, string userId);
    }
}
