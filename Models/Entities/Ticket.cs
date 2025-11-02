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

        // Navigation property
        public User User { get; set; }
    }

}
