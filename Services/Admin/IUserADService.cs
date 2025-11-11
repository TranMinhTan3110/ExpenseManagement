using QuanLyChiTieu_WebApp.Models.Entities;

namespace QuanLyChiTieu_WebApp.Services.Admin
{
    public interface IUserADService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string userId);
        Task<bool> ToggleUserStatusAsync(string userId, bool isActive);
        Task<bool> UpdateUserAsync(User user);
        Task<bool> DeleteUserAsync(string userId);
        Task<int> GetTotalUsersCountAsync();
        Task<int> GetActiveUsersCountAsync();
        Task<int> GetBlockedUsersCountAsync();
        Task<int> GetAdminUsersCountAsync();
    }
}
