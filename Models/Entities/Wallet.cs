using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Wallet
    {
        public int WalletID { get; set; }

        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))

        public string WalletName { get; set; }
        public string WalletType { get; set; }
        public string Icon { get; set; }

        public decimal InitialBalance { get; set; } = 0;
        public decimal Balance { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public User User { get; set; }

        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Goal> Goals { get; set; }
        public ICollection<GoalDeposit> GoalDeposits { get; set; }
    }

}
