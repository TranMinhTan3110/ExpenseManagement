using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class TicketService : ITicketService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TicketService> _logger;
        private readonly INotificationService _notificationService; 

        public TicketService(ApplicationDbContext context,
                             ILogger<TicketService> logger,
                             INotificationService notificationService) 
        {
            _context = context;
            _logger = logger;
            _notificationService = notificationService;
        }

        // Lấy tất cả tickets với thông tin user
        public async Task<List<TicketListViewModel>> GetAllTicketsAsync()
        {
            try
            {
                var tickets = await _context.Tickets
                    .Include(t => t.User)
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new TicketListViewModel
                    {
                        TicketID = t.TicketID,
                        UserName = t.User.FullName ?? t.User.Email,
                        UserEmail = t.User.Email,
                        //Subject = t.Description.Length > 50
                        //    ? t.Description.Substring(0, 50) + "..."
                        //    : t.Description,
                        QuestionType = t.QuestionType,
                        //Priority = "Medium",
                        Status = t.Status,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return tickets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetAllTicketsAsync");
                throw;
            }
        }

        // Lấy chi tiết một ticket
        public async Task<TicketDetailViewModel> GetTicketDetailAsync(int ticketId)
        {
            try
            {
                var ticket = await _context.Tickets
                    .Include(t => t.User)
                    .Where(t => t.TicketID == ticketId)
                    .Select(t => new TicketDetailViewModel
                    {
                        TicketID = t.TicketID,
                        UserName = t.User.FullName ?? t.User.Email,
                        UserEmail = t.User.Email,
                        Description = t.Description,
                        QuestionType = t.QuestionType,
                        Status = t.Status,
                        AdminNote = t.AdminNote,
                        CreatedAt = t.CreatedAt,
                        UpdatedAt = t.UpdatedAt ?? t.CreatedAt,  
                        ResolvedAt = t.ResolvedAt 
                    })
                    .FirstOrDefaultAsync();

                return ticket;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetTicketDetailAsync for TicketID: {TicketId}", ticketId);
                throw;
            }
        }

        // Cập nhật trạng thái ticket
        public async Task<bool> UpdateTicketStatusAsync(UpdateTicketStatusViewModel model)
        {
            try
            {
                var ticket = await _context.Tickets.FindAsync(model.TicketID);

                if (ticket == null)
                {
                    return false;
                }

                // Lấy trạng thái CŨ để so sánh
                string oldStatus = ticket.Status;

                // Cập nhật các trường
                ticket.Status = model.Status;
                ticket.UpdatedAt = DateTime.Now;

                if (!string.IsNullOrEmpty(model.AdminNote))
                {
                    ticket.AdminNote = model.AdminNote;
                }

                // NẾU TRẠNG THÁI LÀ "Resolved" VÀ TRẠNG THÁI CŨ KHÁC "Resolved"
                if (model.Status == "Resolved" && oldStatus != "Resolved")
                {
                    ticket.ResolvedAt = DateTime.Now;

                    // ===== GỬI THÔNG BÁO CHO USER TẠI ĐÂY =====
                    string message = $"Ticket #{ticket.TicketID} của bạn đã được giải quyết.";
                    // Giả sử link xem ticket của user là "/Support/MyTickets" (bạn có thể đổi link này)
                    await _notificationService.CreateNotificationAsync(ticket.UserID, message, "/MyTickets");
                    // ============================================
                }
                else if (model.Status != "Resolved")
                {
                    ticket.ResolvedAt = null;
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Ticket {TicketId} updated to status: {Status}", model.TicketID, model.Status);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in UpdateTicketStatusAsync for TicketID: {TicketId}", model.TicketID);
                throw;
            }
        }

        // Xóa ticket
        public async Task<bool> DeleteTicketAsync(int ticketId)
        {
            try
            {
                var ticket = await _context.Tickets.FindAsync(ticketId);

                if (ticket == null)
                {
                    return false;
                }

                _context.Tickets.Remove(ticket);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Ticket {TicketId} deleted successfully", ticketId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in DeleteTicketAsync for TicketID: {TicketId}", ticketId);
                throw;
            }
        }

        // Lấy thống kê
        public async Task<TicketStatisticsViewModel> GetStatisticsAsync()
        {
            try
            {
                var totalTickets = await _context.Tickets.CountAsync();
                var openTickets = await _context.Tickets.CountAsync(t => t.Status == "Open");
                var pendingTickets = await _context.Tickets.CountAsync(t => t.Status == "Pending");
                var resolvedTickets = await _context.Tickets.CountAsync(t => t.Status == "Resolved");

                return new TicketStatisticsViewModel
                {
                    TotalTickets = totalTickets,
                    OpenTickets = openTickets,
                    PendingTickets = pendingTickets,
                    ResolvedTickets = resolvedTickets
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetStatisticsAsync");
                throw;
            }
        }
        public async Task<List<TicketListViewModel>> GetTicketsByUserIdAsync(string userId)
        {
            try
            {
                var tickets = await _context.Tickets
                    .Where(t => t.UserID == userId) // <-- CHỈ THÊM DÒNG NÀY
                    .Include(t => t.User)
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new TicketListViewModel
                    {
                        TicketID = t.TicketID,
                        UserName = t.User.FullName ?? t.User.Email,
                        UserEmail = t.User.Email,
                        QuestionType = t.QuestionType,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return tickets;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetTicketsByUserIdAsync for UserID: {UserId}", userId);
                throw;
            }
        }
    }
}