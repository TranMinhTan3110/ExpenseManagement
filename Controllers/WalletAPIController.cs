using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.ViewModels; // Hoặc .Models.ViewModels
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims;
using System.Threading.Tasks; // <-- 1. Thêm using này

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/wallet")]
    public class WalletAPIController : ControllerBase // <-- 2. Sửa thành ControllerBase
    {
        private readonly IWalletService _walletService;

        // 3. Sửa tên Constructor
        public WalletAPIController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        // 4. HÀM INDEX() ĐÃ BỊ XÓA

        // --- API TẠO VÍ MỚI ---
        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] CreateWalletViewModel wallet)
        {
            if (ModelState.IsValid)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _walletService.CreateWalletAsync(wallet, userId); // Nhớ thêm Async
                return Ok(new { message = "Tạo ví thành công" });
            }
            return BadRequest(ModelState);
        }

        // --- API LẤY LIST VÍ (BÊN TRÁI) ---
        [HttpGet]
        public async Task<IActionResult> GetUserWallets()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var wallets = await _walletService.GetWalletsByUserIdAsync(userId);
            return Ok(wallets);
        }

        // --- API LẤY CHI TIẾT (BÊN PHẢI) ---
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetWalletDetails(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
           
            var details = await _walletService.GetWalletDetailsAsync(id, userId);
            if (details == null) return NotFound();
            return Ok(details);
        }

        // --- API LẤY DỮ LIỆU CHO MODAL SỬA ---
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWalletById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var wallet = await _walletService.GetWalletByIdAsync(id, userId);
            if (wallet == null) return NotFound();
            return Ok(wallet);
        }

        // --- API LƯU LẠI (SỬA) ---
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWallet(int id, [FromBody] CreateWalletViewModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _walletService.UpdateWalletAsync(id, model, userId);
            if (!result) return NotFound();
            return Ok(new { message = "Cập nhật thành công" });
        }

        // --- API XÓA ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWallet(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _walletService.DeleteWalletAsync(id, userId);
            if (!result) return BadRequest(new { message = "Xóa thất bại! Ví có thể đang được sử dụng." });
            return Ok(new { message = "Xóa thành công" });
        }
    }
}