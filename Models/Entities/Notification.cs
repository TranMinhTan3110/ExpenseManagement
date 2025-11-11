using System;
using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.Models.Entities // (Kiểm tra namespace của bạn)
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        [Required]
        public string UserId { get; set; } // Khóa ngoại
        public virtual User User { get; set; } // <-- Thuộc tính điều hướng

        [Required]
        [StringLength(500)]
        public string Message { get; set; }

        [StringLength(255)]
        public string Url { get; set; } // Link khi bấm vào

        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}