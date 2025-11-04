using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels; // Thêm ViewModel vừa tạo

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ILoginServices
    {
        // Hàm xác thực, trả về User nếu thành công, null nếu thất bại
        Task<User> AuthenticateAsync(string email, string password);

        // Hàm cập nhật lần đăng nhập cuối
        Task UpdateLastLoginAsync(User user);

        // Hàm đăng ký tài khoản mới
        Task<User> RegisterUserAsync(SignUpViewModel model);

        // Hàm kiểm tra email tồn tại
        Task<bool> CheckEmailExistsAsync(string email);
        // Tạo token và lưu vào user
        Task<User?> GeneratePasswordResetTokenAsync(string email);

        // Xác thực token và đổi mật khẩu
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);

        Task<User> FindOrCreateExternalUserAsync(string email, string fullName);

        Task SignInUserAsync(User user);
    }
}