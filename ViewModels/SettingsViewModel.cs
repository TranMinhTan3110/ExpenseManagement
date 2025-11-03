namespace QuanLyChiTieu_WebApp.ViewModels
{
    // ViewModel này sẽ được gửi đến View khi [GET] Profile
    public class SettingsViewModel
    {
        public UpdateAvatarViewModel AvatarForm { get; set; }
        public UpdateSecurityViewModel SecurityForm { get; set; }
        public UpdatePersonalInfoViewModel PersonalInfoForm { get; set; }

        public bool IsExternalUser { get; set; } 
        public string CurrentEmail { get; set; }
    }
}