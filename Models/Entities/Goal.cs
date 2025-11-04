namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Goal
    {
        public int GoalID { get; set; }

        public string UserID { get; set; }  // Khớp với Users.UserID (NVARCHAR(450))

        public string GoalName { get; set; }
        public decimal TargetAmount { get; set; } = 0;
        public decimal CurrentAmount { get; set; } = 0;
        public string Status { get; set; } = "Đang thực hiện";

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public DateTime? CompletionDate { get; set; }

        // Navigation properties
        public User User { get; set; }
        public ICollection<GoalDeposit> GoalDeposits { get; set; }
    }


}
