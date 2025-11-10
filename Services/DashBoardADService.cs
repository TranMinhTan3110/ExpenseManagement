
    using Microsoft.EntityFrameworkCore;
    using QuanLyChiTieu_WebApp.Models.EF;

    namespace QuanLyChiTieu_WebApp.Services
    {
        public class DashBoardADService : IDashBoardADService
        {
            ApplicationDbContext _context;
            public DashBoardADService(ApplicationDbContext context) {
           
                _context =context;

            }
        public Task<int> GetAmountTransactions()
        {
            return _context.Transactions.CountAsync();
        }

        public  Task<int> GetAmountUsers()
            {
                return _context.Users.Where(t => t.Role == "User").CountAsync();
            }

            public Task<int> GetPendingTickets()
            {
           
                return _context.Tickets.Where(t => t.Status == "Pending").CountAsync();
            }

        public Task<int> GetTotalTickets()
        {
            return _context.Tickets.CountAsync();
        }
    }
    }
