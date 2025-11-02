namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Transaction
    {
        public int TransactionID { get; set; }

        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))
        public int WalletID { get; set; }
        public int CategoryID { get; set; }

        public string Type { get; set; }  // "Expense" hoặc "Income"
        public decimal Amount { get; set; }

        public DateTime TransactionDate { get; set; }
        public string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public User User { get; set; }
        public Wallet Wallet { get; set; }
        public Category Category { get; set; }
    }


}
