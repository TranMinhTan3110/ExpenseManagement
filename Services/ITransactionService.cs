using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ITransactionService
    {
        //lấy dữ liệu ví và category để hiển thị lên form
        Task<TransactionFormDataViewModel> GetFormDataAsync(string userId);
        //lấy danh mục theo loại giao dịch
        Task<List<Category>> GetCategoriesByTypeAsync(string type, string userId);
        //tạo giao dịch
        Task CreateTransactionAsync(CreateTransactionViewModel model, string userId);
    }
}
