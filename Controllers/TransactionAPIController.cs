using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.Services;
using QuanLyChiTieu_WebApp.ViewModels;
using System.Security.Claims;

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/transaction")]
    public class TransactionAPIController  : ControllerBase
    {
     private readonly ITransactionService _transactionService;
        public TransactionAPIController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransactionAsync([FromBody] CreateTransactionViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                // Lấy userId từ claims (token), không phải từ tham số
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                // Gọi Service (Service sẽ tự động cập nhật số dư ví)
                await _transactionService.CreateTransactionAsync(model, userId);

                return Ok(new { message = "Tạo giao dịch thành công" });
            }
            catch (Exception ex)
            {
                // Bắt lỗi (ví dụ: "Số dư không đủ") từ Service
                return BadRequest(new { message = ex.Message });
            }
        }
        // GET: /api/transaction/form-data
        [HttpGet("form-data")]
        public async Task<IActionResult> GetFormData()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var formData = await _transactionService.GetFormDataAsync(userId);
            return Ok(formData);
        }

        // API (GET) để Tải Category (Thu nhập/Chi tiêu)
        // GET: /api/transaction/categories?type=Income
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoriesByType([FromQuery] string type)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            // JavaScript sẽ gọi hàm này khi bạn bấm tab "Thu nhập" / "Chi tiêu"
            var categories = await _transactionService.GetCategoriesByTypeAsync(type, userId);
            return Ok(categories);
        }


    }
}
