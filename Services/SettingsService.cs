using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;
using System.Threading.Tasks;
using BCrypt.Net;
using System.Globalization;

namespace QuanLyChiTieu_WebApp.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILoginServices _loginServices;

        public SettingsService(ApplicationDbContext context, ILoginServices loginServices)
        {
            _context = context;
            _loginServices = loginServices;
        }

        private string GetUserId(ClaimsPrincipal userClaimsPrincipal)
        {
            return userClaimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // HÀM [GET] CHÍNH (ĐÃ SỬA)
        public async Task<SettingsViewModel> GetSettingsAsync(ClaimsPrincipal userClaimsPrincipal)
        {
            var userId = GetUserId(userClaimsPrincipal);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return null;

            // Map User sang 3 VM con
            var viewModel = new SettingsViewModel
            {
                AvatarForm = new UpdateAvatarViewModel
                {
                    FullName = user.FullName
                },
                SecurityForm = new UpdateSecurityViewModel
                {
                    // Để trống, người dùng phải tự nhập
                },
                PersonalInfoForm = new UpdatePersonalInfoViewModel
                {
                    Address = user.Address,
                    City = user.City,
                    Country = user.Country,
                    DateOfBirth = user.DateOfBirth.HasValue
                                  ? user.DateOfBirth.Value.ToString("yyyy-MM-dd")
                                  : null
                },
                // 1. Kiểm tra xem có phải tài khoản Google không
                IsExternalUser = (user.PasswordHash == "EXTERNAL_AUTH_ONLY"),
                // 2. Lấy email hiện tại
                CurrentEmail = user.Email
            };

            return viewModel;
        }

        // HÀM CHO FORM 1 (AVATAR/NAME)
        public async Task<UpdateProfileResult> UpdateAvatarAsync(ClaimsPrincipal userClaimsPrincipal, UpdateAvatarViewModel model)
        {
            var userId = GetUserId(userClaimsPrincipal);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new UpdateProfileResult { Success = false, ErrorMessage = "Không tìm thấy user." };

            user.FullName = model.FullName;
            // TODO: Thêm logic xử lý upload file "model.AvatarFile" ở đây

            _context.Update(user);
            await _context.SaveChangesAsync();
            return new UpdateProfileResult { Success = true };
        }

        // HÀM CHO FORM 2 (SECURITY)
        // Trong Services/SettingsService.cs
        public async Task<UpdateProfileResult> UpdateSecurityAsync(ClaimsPrincipal userClaimsPrincipal, UpdateSecurityViewModel model)
        {
            var userId = GetUserId(userClaimsPrincipal);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new UpdateProfileResult { Success = false, ErrorMessage = "Không tìm thấy user." };

            bool isExternal = (user.PasswordHash == "EXTERNAL_AUTH_ONLY");
            bool changed = false;

            // --- 1. LOGIC CHO USER GOOGLE ---
            if (isExternal)
            {
                // Yêu cầu 1: Cấm đổi email
                if (!string.IsNullOrEmpty(model.NewEmail))
                {
                    return new UpdateProfileResult { Success = false, ErrorMessage = "Không thể thay đổi email của tài khoản liên kết Google." };
                }

                // Cho phép đặt mật khẩu lần đầu (không cần CurrentPassword)
                if (!string.IsNullOrEmpty(model.NewPassword))
                {
                    if (model.NewPassword != model.ConfirmNewPassword)
                        return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu mới không khớp." };

                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                    changed = true;
                }
            }
            // --- 2. LOGIC CHO USER THƯỜNG ---
            else
            {
                // Kiểm tra xem có yêu cầu thay đổi gì không
                if (string.IsNullOrEmpty(model.NewEmail) && string.IsNullOrEmpty(model.NewPassword))
                    return new UpdateProfileResult { Success = false, ErrorMessage = "Không có thông tin nào được thay đổi." };

                // Bắt buộc phải có mật khẩu hiện tại
                if (string.IsNullOrEmpty(model.CurrentPassword))
                    return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu hiện tại là bắt buộc." };

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.PasswordHash);
                if (!isPasswordValid)
                    return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu hiện tại không chính xác." };

                // Mật khẩu đúng, giờ kiểm tra các thay đổi
                if (!string.IsNullOrEmpty(model.NewEmail) && user.Email != model.NewEmail)
                {
                    if (await _loginServices.CheckEmailExistsAsync(model.NewEmail))
                        return new UpdateProfileResult { Success = false, ErrorMessage = "Email mới đã được sử dụng." };

                    user.Email = model.NewEmail;
                    changed = true;
                }

                if (!string.IsNullOrEmpty(model.NewPassword))
                {
                    if (model.NewPassword != model.ConfirmNewPassword)
                        return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu mới không khớp." };

                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);
                    changed = true;
                }
            }

            // Nếu không có gì thay đổi (ví dụ: user Google chỉ bấm Save)
            if (!changed)
                return new UpdateProfileResult { Success = false, ErrorMessage = "Không có thông tin nào được thay đổi." };

            _context.Update(user);
            await _context.SaveChangesAsync();

            // Nếu user thường vừa đổi email, làm mới cookie của họ
            if (changed && !isExternal && !string.IsNullOrEmpty(model.NewEmail) && user.Email == model.NewEmail)
            {
                await _loginServices.SignInUserAsync(user);
            }

            return new UpdateProfileResult { Success = true };
        }

        // HÀM CHO FORM 3 (PERSONAL INFO)
        public async Task<UpdateProfileResult> UpdatePersonalInfoAsync(ClaimsPrincipal userClaimsPrincipal, UpdatePersonalInfoViewModel model)
        {
            var userId = GetUserId(userClaimsPrincipal);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new UpdateProfileResult { Success = false, ErrorMessage = "Không tìm thấy user." };

            user.Address = model.Address;
            user.City = model.City;
            user.Country = model.Country;
            // --- SỬA LOGIC LƯU NGÀY SINH ---
            if (string.IsNullOrEmpty(model.DateOfBirth))
            {
                user.DateOfBirth = null;
            }
            else
            {
                // Thử chuyển đổi chuỗi "yyyy-MM-dd" (ví dụ: "2025-11-25")
                if (DateTime.TryParseExact(model.DateOfBirth, "yyyy-MM-dd", // PHẢI KHỚP VỚI JS
                                           CultureInfo.InvariantCulture,
                                           DateTimeStyles.None,
                                           out DateTime parsedDate))
                {
                    user.DateOfBirth = parsedDate; // Thành công!
                }
                else
                {
                    user.DateOfBirth = null; // Thất bại, gán null
                }
            }

            _context.Update(user);
            await _context.SaveChangesAsync();
            return new UpdateProfileResult { Success = true };
        }
    }
}