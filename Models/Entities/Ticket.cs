namespace QuanLyChiTieu_WebApp.Models.Entities
{
    public class Ticket
    {
        public int TicketID { get; set; }

        public string UserID { get; set; }  // Khớp với kiểu NVARCHAR(450)

        public string QuestionType { get; set; }
        public string RespondType { get; set; }
        public string Description { get; set; }
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public string AdminNote { get; set; } = "Thanks for your feedback, we will consider it soon";
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }

        // Navigation property
        public User User { get; set; }
    }

}
