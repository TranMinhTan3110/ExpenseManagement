using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardAPIController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardAPIController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData([FromQuery] int days = 7)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Vui lòng đăng nhập" });
                }

                var data = await _dashboardService.GetDashboardDataAsync(userId, days); // ✅ Thêm days
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
    }
}