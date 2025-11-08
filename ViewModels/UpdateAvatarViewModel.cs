using Microsoft.AspNetCore.Http;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class UpdateAvatarViewModel
    {
        public string FullName { get; set; }

        // Sẽ dùng cho logic upload file sau
        public IFormFile AvatarFile { get; set; }
    }
}