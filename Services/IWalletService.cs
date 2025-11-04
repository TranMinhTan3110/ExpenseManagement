using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.ViewModels;


namespace QuanLyChiTieu_WebApp.Services
{
    public interface IWalletService
    {
        Task<List<Wallet>> GetWalletsByUserIdAsync(string userId);
        Task<WalletDetailsViewModel> GetWalletDetailsAsync(int walletId, string userId);
        Task<Wallet> GetWalletByIdAsync(int walletId, string userId);

        // Sửa: Dùng CreateWalletViewModel
        Task<bool> UpdateWalletAsync(int walletId, CreateWalletViewModel model, string userId);
        Task<bool> DeleteWalletAsync(int walletId, string userId);
        //lưu ds ví của người dùng
        Task CreateWalletAsync(CreateWalletViewModel model, string userId);

    }
}
