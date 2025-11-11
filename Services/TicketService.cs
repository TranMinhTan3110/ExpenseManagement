using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class TicketService : ITicketService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TicketService> _logger;

        public TicketService(ApplicationDbContext context, ILogger<TicketService> logger)
        {
            _context = context;
            _logger = logger;
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

                // Cập nhật status
                ticket.Status = model.Status;

                // SỬA LỖI: Luôn cập nhật thời gian "UpdatedAt" khi có thay đổi
                ticket.UpdatedAt = DateTime.Now;

                // Cập nhật ghi chú admin (nếu có)
                if (!string.IsNullOrEmpty(model.AdminNote))
                {
                    ticket.AdminNote = model.AdminNote;
                }

                // Nếu trạng thái là "Resolved" VÀ chưa có ngày resolved
                if (model.Status == "Resolved" && !ticket.ResolvedAt.HasValue)
                {
                    ticket.ResolvedAt = DateTime.Now;
                }
                // Nếu đổi từ "Resolved" sang trạng thái khác (ví dụ: "In Progress")
                else if (model.Status != "Resolved")
                {
                    ticket.ResolvedAt = null; // Xóa ngày resolved
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Ticket {TicketId} updated to status: {Status}",
                    model.TicketID, model.Status);

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
    }
}