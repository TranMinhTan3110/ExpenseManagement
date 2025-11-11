using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ITicketService
    {
        Task<List<TicketListViewModel>> GetAllTicketsAsync();
        Task<TicketDetailViewModel> GetTicketDetailAsync(int ticketId);
        Task<bool> UpdateTicketStatusAsync(UpdateTicketStatusViewModel model);
        Task<bool> DeleteTicketAsync(int ticketId);
        Task<TicketStatisticsViewModel> GetStatisticsAsync();
        Task<List<TicketListViewModel>> GetTicketsByUserIdAsync(string userId);
    }
}