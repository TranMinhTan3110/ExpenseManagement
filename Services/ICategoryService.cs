using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ICategoryService
    {
        Task<List<Icon>> GetIcons();
        Task<List<Color>> GetColors();
        Task<List<Category>> GetListCategory(string UserID);
        Task CreateCategoryAsync(CreateCategoryViewModel model, string userId);
        Task<Category> GetCategoryByIdAsync(int categoryId, string userId);
        Task<bool> UpdateCategoryAsync(int categoryId, CreateCategoryViewModel model, string userId);

        Task<bool> DeleteCategoryAsync(int categoryId, string userId);
    }
}
