using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;

        //inject
        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateCategoryAsync(CreateCategoryViewModel model, string userId)
        {
            var newCategory = new Category
            {
                CategoryName = model.CategoryName,
                Type = model.Type,
                IconID = model.IconID,
                ColorID = model.ColorID,
                UserID = userId,
                CreatedAt = DateTime.Now
            };

            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();
        }



        //hamf lấy màu
        public async Task<List<Color>> GetColors()
        {
            return await _context.Colors.ToListAsync();

        }
        //hàm lấy icon 
        public async Task<List<Icon>> GetIcons()
        {
            return await _context.Icons.ToListAsync();

        }
        //lấy danh sách category của user

        public async Task<List<Category>> GetListCategory(string UserID)
        {
            return await _context.Categories
                                 .Where(c => c.UserID == UserID)
                                 .Include(c => c.Icon)
                                 .Include(c => c.Color)
                                 .ToListAsync();
        }

        public async Task<Category> GetCategoryByIdAsync(int categoryId, string userId)
        {
            return await _context.Categories
                .Include(c => c.Icon)
                .Include(c => c.Color)
                .FirstOrDefaultAsync(c => c.CategoryID == categoryId && c.UserID == userId);
        }
        public async Task<bool> UpdateCategoryAsync(int categoryId, CreateCategoryViewModel model, string userId)
        {
            // Tìm category phải SỬA, và phải ĐÚNG là của user này
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryID == categoryId && c.UserID == userId);

            if (category == null)
            {
                return false; // Không tìm thấy hoặc không có quyền sửa
            }

            // Cập nhật
            category.CategoryName = model.CategoryName;
            category.Type = model.Type;
            category.IconID = model.IconID;
            category.ColorID = model.ColorID;

            await _context.SaveChangesAsync();
            return true;
        }

        // 4. HÀM XÓA
        public async Task<bool> DeleteCategoryAsync(int categoryId, string userId)
        {
            // Tìm category phải XÓA, và phải ĐÚNG là của user này
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.CategoryID == categoryId && c.UserID == userId);

            if (category == null)
            {
                return false; // Không tìm thấy hoặc không có quyền xóa
            }

            try
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
                return true; // Xóa thành công
            }
            catch (DbUpdateException)
            {
                
                return false; // Xóa thất bại
            }
        }
    }

}
