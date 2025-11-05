using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims;
using System.Threading.Tasks; // Đảm bảo có using này

namespace QuanLyChiTieu_WebApp.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/category")]
    public class CategoryAPIController : Controller
    {
        private readonly ICategoryService _categoryService;
        public CategoryAPIController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // --- 1. API (GET) ĐỂ TẢI TẤT CẢ DỮ LIỆU CẦN CHO TRANG ---
      
        // Đường dẫn: GET /api/category/page-data
        [HttpGet("page-data")]
        public async Task<IActionResult> GetPageData()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Gọi Service lấy hết 3 list
            var userCategories = await _categoryService.GetListCategory(userId);
            var icons = await _categoryService.GetIcons();
            var colors = await _categoryService.GetColors();

            // Trả về 1 cục JSON chứa cả 3
            return Ok(new
            {
                userCategories = userCategories,
                allIcons = icons,
                allColors = colors
            });
        }

        // --- 2. API (POST) ĐỂ TẠO MỚI CATEGORY ---
        // JavaScript sẽ gọi API này khi nhấn nút "Create"
        // Đường dẫn: POST /api/category
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryViewModel model)
        {
            if (ModelState.IsValid)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                await _categoryService.CreateCategoryAsync(model, userId);

                return Ok(new { message = "Tạo category thành công" });
            }

            return BadRequest(ModelState);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategoryById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Gọi Service để lấy 1 category
            var category = await _categoryService.GetCategoryByIdAsync(id, userId);

            if (category == null)
            {
                return NotFound(); // Không tìm thấy hoặc không có quyền
            }

            return Ok(category); // Trả về JSON của 1 category đó
        }

        // --- 4. API (PUT) ĐỂ CẬP NHẬT (SỬA) CATEGORY ---
        // (PUT /api/category/{id})
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryViewModel model)
        {
            if (ModelState.IsValid)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                // Gọi Service để cập nhật
                var result = await _categoryService.UpdateCategoryAsync(id, model, userId);

                if (result == false)
                {
                    return NotFound(); // Không tìm thấy hoặc không có quyền
                }

                return Ok(new { message = "Cập nhật thành công" });
            }
            return BadRequest(ModelState);
        }

        // --- 5. API (DELETE) ĐỂ XÓA CATEGORY ---
        // (DELETE /api/category/{id})
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Gọi Service để xóa
            var result = await _categoryService.DeleteCategoryAsync(id, userId);

            if (result == false)
            {
                // Không tìm thấy, không có quyền, hoặc
                // LỖI (do category này đang được Transaction/Budget sử dụng)
                return BadRequest(new { message = "Xóa thất bại! Category này có thể đang được sử dụng." });
            }

            return Ok(new { message = "Xóa thành công" });
        }
    
}
}