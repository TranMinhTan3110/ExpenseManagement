using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Services.Admin;
//using QuanLyChiTieu_WebApp.Services.Interface;

namespace QuanLyChiTieu_WebApp.Services
{
    public class UserService : IUserADService
    {
        private readonly ApplicationDbContext _context; // Thay tên DbContext cho đúng

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<bool> ToggleUserStatusAsync(string userId, bool isActive)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.IsActive = isActive;
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateUserAsync(User user)
        {
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _context.Users.CountAsync();
        }

        public async Task<int> GetActiveUsersCountAsync()
        {
            return await _context.Users.CountAsync(u => u.IsActive);
        }

        public async Task<int> GetBlockedUsersCountAsync()
        {
            return await _context.Users.CountAsync(u => !u.IsActive);
        }

        public async Task<int> GetAdminUsersCountAsync()
        {
            return await _context.Users.CountAsync(u => u.Role == "Admin");
        }
    }
}