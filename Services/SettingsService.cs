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
                }
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
        public async Task<UpdateProfileResult> UpdateSecurityAsync(ClaimsPrincipal userClaimsPrincipal, UpdateSecurityViewModel model)
        {
            var userId = GetUserId(userClaimsPrincipal);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return new UpdateProfileResult { Success = false, ErrorMessage = "Không tìm thấy user." };

            if (string.IsNullOrEmpty(model.CurrentPassword))
                return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu hiện tại là bắt buộc." };

            if (user.PasswordHash != "EXTERNAL_AUTH_ONLY")
            {
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(model.CurrentPassword, user.PasswordHash);
                if (!isPasswordValid)
                    return new UpdateProfileResult { Success = false, ErrorMessage = "Mật khẩu hiện tại không chính xác." };
            }

            bool changed = false;
            if (!string.IsNullOrEmpty(model.NewEmail) && user.Email != model.NewEmail)
            {
                // ... (Logic kiểm tra email trùng)
                user.Email = model.NewEmail;
                changed = true;
            }

            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                // ... (Logic đổi mật khẩu)
                changed = true;
            }

            if (!changed) return new UpdateProfileResult { Success = false, ErrorMessage = "Không có thông tin nào được thay đổi." };

            _context.Update(user);
            await _context.SaveChangesAsync();

            if (!string.IsNullOrEmpty(model.NewEmail) && user.Email == model.NewEmail)
            {
                // Nếu email đã được thay đổi, phát hành lại cookie
                await _loginServices.SignInUserAsync(user);
            }
            // ----------------------------------------

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