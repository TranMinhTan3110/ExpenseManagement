using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services; // Thêm service
using System.Security.Claims; // Thêm thư viện để lấy ID user

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class MyTicketsController : Controller
    {
        private readonly ITicketService _ticketService;

        public MyTicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        // HÀM NÀY SẼ CHẠY KHI BẠN VÀO /MyTickets
        public async Task<IActionResult> Index()
        {
            // Lấy ID của user đang đăng nhập
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Login", "Home"); // Hoặc trang đăng nhập của bạn
            }

            // Dùng hàm service mới tạo ở Bước 1
            var myTickets = await _ticketService.GetTicketsByUserIdAsync(userId);

            // Trả về view và gửi kèm danh sách ticket
            return View(myTickets);
        }
        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userEmail = User.FindFirstValue(ClaimTypes.Email); // Lấy email để kiểm tra

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(); // Chưa đăng nhập
            }

            // Dùng hàm service đã có sẵn
            var ticket = await _ticketService.GetTicketDetailAsync(id);

            if (ticket == null)
            {
                return NotFound();
            }

            // KIỂM TRA BẢO MẬT: Đảm bảo user này CHỈ xem được ticket của mình
            if (ticket.UserEmail != userEmail)
            {
                return Forbid(); // Cấm xem ticket của người khác
            }

            return Json(ticket); // Trả về JSON cho JavaScript
        }
    }
}