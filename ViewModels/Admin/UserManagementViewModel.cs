using QuanLyChiTieu_WebApp.Models.Entities;
namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class UserManagementViewModel
    {
        public IEnumerable<User> Users { get; set; }
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int BlockedUsers { get; set; }
        public int AdminUsers { get; set; }
    }
}