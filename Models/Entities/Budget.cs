using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
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

        public bool IsRecurring { get; set; }

        // Navigation properties
        [ValidateNever]
        public User User { get; set; }
        [ValidateNever]
        public Category Category { get; set; }
    }


}
