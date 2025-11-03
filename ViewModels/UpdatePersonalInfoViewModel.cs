using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class UpdatePersonalInfoViewModel
    {
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }

        public string DateOfBirth { get; set; }
    }
}