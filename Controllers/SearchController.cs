using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    public class SearchController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ApplicationDbContext context, ILogger<SearchController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /Search?q=cafe
        public async Task<IActionResult> Index(string q)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return RedirectToAction("Index", "Login");
            }

            // Lấy danh sách WalletID của user
            var userWalletIds = await _context.Wallets
                .Where(w => w.UserID == userId)
                .Select(w => w.WalletID)
                .ToListAsync();

            ViewBag.SearchQuery = q ?? "";
            ViewBag.UserWalletIds = userWalletIds;

            return View();
        }
    }
}