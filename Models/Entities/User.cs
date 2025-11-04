using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class User 
    {
        [Key]
        public string UserID { get; set; }

        [Required]
        [MaxLength(256)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        // Profile
        [MaxLength(150)]
        public string FullName { get; set; }

        [MaxLength(500)]
        public string AvatarUrl { get; set; }

        // Optional info
        [MaxLength(255)]
        public string Address { get; set; }

        [MaxLength(100)]
        public string City { get; set; }

        [MaxLength(100)]
        public string Country { get; set; }

        public DateTime? DateOfBirth { get; set; }

        // System
        [MaxLength(20)]
        public string Role { get; set; } = "User";

        public bool IsActive { get; set; } = true;

        public DateTime? LastLogin { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        //reset password
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

        // Navigation properties
        public ICollection<Ticket> Tickets { get; set; }
        public ICollection<Wallet> Wallets { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Goal> Goals { get; set; }
        public ICollection<GoalDeposit> GoalDeposits { get; set; }
        public ICollection<Category> Categories { get; set; }
        public ICollection<Budget> Budgets { get; set; }
    }

}
