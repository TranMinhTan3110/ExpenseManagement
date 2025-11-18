using QuanLyChiTieu_WebApp.Models.Entities;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class UserManagementViewModel
    {
        // Thống kê
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int BlockedUsers { get; set; }
        public int AdminUsers { get; set; }

        // Pagination
        public PaginatedList<User> Users { get; set; }

        // Search & Filter
        public string SearchTerm { get; set; }
        public string RoleFilter { get; set; }
        public string StatusFilter { get; set; }
    }
}