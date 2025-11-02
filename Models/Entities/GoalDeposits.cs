namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class GoalDeposit
    {
        public int DepositID { get; set; }

        public int GoalID { get; set; }
        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))
        public int WalletID { get; set; }

        public decimal Amount { get; set; }
        public DateTime DepositDate { get; set; } = DateTime.Now;
        public string Note { get; set; }

        // Navigation properties
        public Goal Goal { get; set; }
        public User User { get; set; }
        public Wallet Wallet { get; set; }
    }


}
