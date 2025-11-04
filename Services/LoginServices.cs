using BCrypt.Net; // Cần dùng BCrypt
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels; // Cần dùng SignUpViewModel
using System.Security.Cryptography; // dùng để tạo token ngẫu nhiên
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies; 
using System.Security.Claims; 
using QuanLyChiTieu_WebApp.Models.Entities; 
namespace QuanLyChiTieu_WebApp.Services
{
    // Lớp này phải kế thừa từ interface CỦA BẠN
    public class LoginServices : ILoginServices
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        // Service này giờ chỉ cần DbContext
        public LoginServices(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        // Triển khai hàm AuthenticateAsync
        public async Task<User> AuthenticateAsync(string email, string password)
        {
            // Báo cho DbContext: "Lấy dữ liệu nhưng đừng theo dõi nó."
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

            if (user == null)
            {
                return null; // Không tìm thấy user
            }

            // Xác thực mật khẩu
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return null; // Sai mật khẩu
            }

            // Trả về một đối tượng 'user' KHÔNG BỊ THEO DÕI
            return user;
        }

        // Triển khai hàm CheckEmailExistsAsync
        public async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        // Triển khai hàm RegisterUserAsync
        public async Task<User> RegisterUserAsync(SignUpViewModel model)
        {
            // Băm mật khẩu
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var user = new User
            {
                UserID = Guid.NewGuid().ToString(),
                FullName = model.FullName,
                Email = model.Email,
                PasswordHash = hashedPassword,
                IsActive = true,
                Role = "User",
                CreatedAt = DateTime.Now,

                // --- THÊM CÁC GIÁ TRỊ MẶC ---
                //Address = string.Empty,
                //City = string.Empty,
                //Country = string.Empty,
                //AvatarUrl = string.Empty
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(); 

            return user;
        }

        // hàm UpdateLastLoginAsync
        public async Task UpdateLastLoginAsync(string userId)
        {
            // 1. Tự tìm user bằng ID (dùng FindAsync là nhanh nhất)
            var userToUpdate = await _context.Users.FindAsync(userId);

            // 2. Kiểm tra (dù hiếm khi xảy ra)
            if (userToUpdate != null)
            {
                // 3. Cập nhật thuộc tính
                userToUpdate.LastLogin = DateTime.Now;

                // 4. Lưu
                // Vì đây là đối tượng duy nhất hàm này theo dõi,
                // nó sẽ không bao giờ bị xung đột.
                await _context.SaveChangesAsync();
            }
        }
        public async Task<User?> GeneratePasswordResetTokenAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Không tìm thấy user
                return null;
            }

            // Tạo token ngẫu nhiên, an toàn
            string token = Convert.ToHexString(RandomNumberGenerator.GetBytes(64));

            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.Now.AddHours(1); // Cho token 1 giờ

            _context.Update(user);
            await _context.SaveChangesAsync();

            return user;
        }

        // 
        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(
                u => u.Email == email &&
                     u.PasswordResetToken == token &&
                     u.PasswordResetTokenExpiry > DateTime.Now); // Token còn hạn

            if (user == null)
            {
                // Token không hợp lệ hoặc đã hết hạn
                return false;
            }

            // Hash mật khẩu mới
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

            // Vô hiệu hóa token sau khi dùng
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            _context.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<User> FindOrCreateExternalUserAsync(string email, string fullName)
        {
            // 1. Thử tìm user bằng email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // 2. Nếu tìm thấy, trả về ngay
            if (user != null)
            {
                return user;
            }

            // 3. Nếu không tìm thấy, tạo user mới
            var newUser = new User
            {
                UserID = Guid.NewGuid().ToString(),
                Email = email,
                FullName = fullName,
                // Đặt một PasswordHash "đặc biệt" để biết đây là tài khoản
                // bên ngoài và họ không thể dùng form đăng nhập thường
                PasswordHash = "EXTERNAL_AUTH_ONLY",
                IsActive = true,
                Role = "User",
                CreatedAt = DateTime.Now
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser;
        }
        public async Task SignInUserAsync(User user)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID),
            new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

            var claimsIdentity = new ClaimsIdentity(
                claims, CookieAuthenticationDefaults.AuthenticationScheme);

            var authProperties = new AuthenticationProperties
            {
                AllowRefresh = true,
            };

            // Dùng HttpContextAccessor để truy cập và phát hành cookie
            await _httpContextAccessor.HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
        }
    }
}