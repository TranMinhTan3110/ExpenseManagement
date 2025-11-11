using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    // ViewModel cho danh sách tickets trong DataTable
    public class TicketListViewModel
    {
        public int TicketID { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string Subject { get; set; }
        public string QuestionType { get; set; }
        public string Priority { get; set; } = "Medium";
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ViewModel cho chi tiết ticket
    public class TicketDetailViewModel
    {
        public int TicketID { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string QuestionType { get; set; }
        //public string RespondType { get; set; }
        //public string Priority { get; set; }
        public string Status { get; set; }
        public string AdminNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    // ViewModel cho cập nhật status
    public class UpdateTicketStatusViewModel
    {
        [Required]
        public int TicketID { get; set; }

        [Required]
        public string Status { get; set; }

        //public string Priority { get; set; }

        public string AdminNote { get; set; }
    }

    // ViewModel cho statistics
    public class TicketStatisticsViewModel
    {
        public int TotalTickets { get; set; }
        public int OpenTickets { get; set; }
        public int PendingTickets { get; set; }
        public int ResolvedTickets { get; set; }
    }
}