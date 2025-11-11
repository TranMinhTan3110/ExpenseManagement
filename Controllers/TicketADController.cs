using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize(Roles = "Admin")]
    public class TicketADController : Controller
    {
        private readonly ITicketService _ticketService;
        private readonly ILogger<TicketADController> _logger;

        public TicketADController(ITicketService ticketService, ILogger<TicketADController> logger)
        {
            _ticketService = ticketService;
            _logger = logger;
        }

        // GET: /TicketAD/Index
        public IActionResult Index()
        {
            return View();
        }

        // GET: /TicketAD/Statistics
        [HttpGet]
        public async Task<IActionResult> Statistics()
        {
            try
            {
                var stats = await _ticketService.GetStatisticsAsync();
                return Json(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ticket statistics");
                return Json(new
                {
                    TotalTickets = 0,
                    OpenTickets = 0,
                    InProgressTickets = 0,
                    ResolvedTickets = 0
                });
            }
        }

        // GET: /TicketAD/GetAll
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tickets = await _ticketService.GetAllTicketsAsync();
                return Json(new { data = tickets });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all tickets");
                return Json(new { data = new List<TicketListViewModel>() });
            }
        }

        // GET: /TicketAD/Details/5
        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            try
            {
                var ticket = await _ticketService.GetTicketDetailAsync(id);

                if (ticket == null)
                {
                    return NotFound(new { message = "Ticket not found" });
                }

                return Json(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ticket detail for ID: {TicketId}", id);
                return BadRequest(new { message = "Error loading ticket details" });
            }
        }

        // POST: /TicketAD/UpdateStatus
        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateTicketStatusViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Invalid data" });
                }

                var result = await _ticketService.UpdateTicketStatusAsync(model);

                if (result)
                {
                    return Json(new { success = true, message = "Ticket updated successfully" });
                }

                return BadRequest(new { success = false, message = "Failed to update ticket" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ticket status for ID: {TicketId}", model.TicketID);
                return BadRequest(new { success = false, message = "Error updating ticket" });
            }
        }

        // DELETE: /TicketAD/Delete/5
        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _ticketService.DeleteTicketAsync(id);

                if (result)
                {
                    return Json(new { success = true, message = "Ticket deleted successfully" });
                }

                return NotFound(new { success = false, message = "Ticket not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ticket ID: {TicketId}", id);
                return BadRequest(new { success = false, message = "Error deleting ticket" });
            }
        }
    }
}