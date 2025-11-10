using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize(Roles = "Admin")]
    public class DashBoardADController : Controller
    {
        private readonly IDashBoardADService _dashBoardADService;
        public DashBoardADController(IDashBoardADService dashBoardADService1) { 
        
            _dashBoardADService = dashBoardADService1;
        }

        public async Task<IActionResult> Index()
        {
            var userCount = await _dashBoardADService.GetAmountUsers();
            var transactionCount = await _dashBoardADService.GetAmountTransactions();
            var pendingTicketCount = await _dashBoardADService.GetPendingTickets();
            var totalTicketCount = await _dashBoardADService.GetTotalTickets();

            ViewBag.UserCount = userCount;
            ViewBag.TransactionCount = transactionCount;
            ViewBag.PendingTicketCount = pendingTicketCount;
            ViewBag.TotalTicketCount = totalTicketCount;

            return View();
        }


    }
}
