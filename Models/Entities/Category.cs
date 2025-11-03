namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Category
    {
        public int CategoryID { get; set; }

        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))

        public string CategoryName { get; set; }
        public string Type { get; set; }  // "Expense" hoặc "Income"
        public int IconID { get; set; }  // Khóa-ngoại-trỏ-đến-bảng-Icon
        public int ColorID { get; set; } // Khóa-ngoại-trỏ-đến-bảng-Color

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public User User { get; set; }
        //public virtual User User { get; set; }
        public virtual Icon Icon { get; set; }
        public virtual Color Color { get; set; }
        public ICollection<Transaction> Transactions { get; set; }
        public ICollection<Budget> Budgets { get; set; }
    }

}
