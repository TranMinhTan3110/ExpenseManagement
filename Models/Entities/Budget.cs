namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Budget
    {
        public int BudgetID { get; set; }

        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))
        public int CategoryID { get; set; }

        public decimal BudgetAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation properties
        public User User { get; set; }
        public Category Category { get; set; }
    }


}
