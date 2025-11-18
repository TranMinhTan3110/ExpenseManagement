using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services.Admin
{
    public interface IUserADService
    {
        // Pagination
        Task<PaginatedList<User>> GetUsersAsync(
            int pageIndex = 1,
            int pageSize = 10,
            string searchTerm = null,
            string roleFilter = null,
            string statusFilter = null);

        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string userId);
        Task<bool> ToggleUserStatusAsync(string userId, bool isActive);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> UpdateLastLoginAsync(string userId);
        Task<bool> DeleteUserAsync(string userId);

        Task<int> GetTotalUsersCountAsync();
        Task<int> GetActiveUsersCountAsync();
        Task<int> GetBlockedUsersCountAsync();
        Task<int> GetAdminUsersCountAsync();
    }
}