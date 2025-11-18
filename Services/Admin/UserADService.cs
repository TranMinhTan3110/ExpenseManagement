using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Services.Admin;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class UserADService : IUserADService
    {
        private readonly ApplicationDbContext _context;

        public UserADService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách user với phân trang và tìm kiếm
        public async Task<PaginatedList<User>> GetUsersAsync(
            int pageIndex = 1,
            int pageSize = 10,
            string searchTerm = null,
            string roleFilter = null,
            string statusFilter = null)
        {
            var query = _context.Users.AsQueryable();

            // Tìm kiếm
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(u =>
                    u.FullName.ToLower().Contains(searchTerm) ||
                    u.Email.ToLower().Contains(searchTerm) ||
                    u.UserID.ToLower().Contains(searchTerm)
                );
            }

            // Lọc theo Role
            if (!string.IsNullOrWhiteSpace(roleFilter) && roleFilter != "All")
            {
                query = query.Where(u => u.Role == roleFilter);
            }

            // Lọc theo Status
            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                if (statusFilter == "Active")
                    query = query.Where(u => u.IsActive);
                else if (statusFilter == "Blocked")
                    query = query.Where(u => !u.IsActive);
            }

            // Sắp xếp
            query = query.OrderByDescending(u => u.CreatedAt);

            return await PaginatedList<User>.CreateAsync(query, pageIndex, pageSize);
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

        // FIX: Update LastLogin khi user đăng nhập
        public async Task<bool> UpdateLastLoginAsync(string userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return false;

                user.LastLogin = DateTime.Now;
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