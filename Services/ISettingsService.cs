using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ISettingsService
    {
        // Sửa hàm này: Trả về 1 VM cha
        Task<SettingsViewModel> GetSettingsAsync(ClaimsPrincipal userClaimsPrincipal);

        // Hàm cho Form 1
        Task<UpdateProfileResult> UpdateAvatarAsync(ClaimsPrincipal userClaimsPrincipal, UpdateAvatarViewModel model);

        // Hàm cho Form 2
        Task<UpdateProfileResult> UpdateSecurityAsync(ClaimsPrincipal userClaimsPrincipal, UpdateSecurityViewModel model);

        // Hàm cho Form 3
        Task<UpdateProfileResult> UpdatePersonalInfoAsync(ClaimsPrincipal userClaimsPrincipal, UpdatePersonalInfoViewModel model);
    }
}