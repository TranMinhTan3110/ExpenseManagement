using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.ViewModels; // Hoặc .Models.ViewModels
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public class WalletService : IWalletService
    {
        private readonly ApplicationDbContext _context;

        public WalletService(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. SỬA LẠI HÀM CREATE ---
        public async Task CreateWalletAsync(CreateWalletViewModel model, string userId)
        {
            // Gọi hàm phụ để lấy icon class dựa trên Type
            string iconClass = GetIconForWalletType(model.WalletType);

            var newWallet = new Wallet
            {
                UserID = userId,
                WalletName = model.WalletName,
                WalletType = model.WalletType,
                InitialBalance = model.InitialBalance,
                Balance = model.InitialBalance,
                Icon = iconClass, // <-- THAY ĐỔI Ở ĐÂY
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            _context.Wallets.Add(newWallet);
            await _context.SaveChangesAsync();
        }

        // --- 2. THÊM HÀM PHỤ NÀY VÀO ---
        private string GetIconForWalletType(string walletType)
        {
            // (Bạn có thể đổi tên icon class cho đúng ý bạn)
            switch (walletType)
            {
                case "Bank":
                    return "fa-solid fa-building-columns";
                case "Cash":
                    return "fa-solid fa-money-bill-wave";
                case "E-Wallet":
                    return "fa-solid fa-wallet";
                case "Credit Card":
                    return "fa-regular fa-credit-card";
                case "Other":
                default:
                    return "fa-solid fa-circle-question"; // Icon cho "Khác"
            }
        }

        // --- (CÁC HÀM KHÁC GIỮ NGUYÊN) ---

        public async Task<List<Wallet>> GetWalletsByUserIdAsync(string userId)
        {
            return await _context.Wallets
                .Where(w => w.UserID == userId)
                .OrderBy(w => w.WalletName)
                .ToListAsync();
        }

        public async Task<WalletDetailsViewModel> GetWalletDetailsAsync(int walletId, string userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

            if (wallet == null) return null;

            var startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var endDate = startDate.AddMonths(1);

            // a. Lấy chi tiêu (Dùng ?? 0 để an toàn nếu rỗng)
            var monthlyExpenses = await _context.Transactions
                .Where(t => t.WalletID == walletId &&
                            (t.Type == "Expense" || t.Type == "Expenses") &&
                            t.TransactionDate >= startDate &&
                            t.TransactionDate < endDate)
                .SumAsync(t => (decimal?)t.Amount) ?? 0m; // <-- Thêm 'm'

            // b. Lấy dữ liệu biểu đồ (An toàn)
            var pieData = await _context.Transactions
                .Where(t => t.WalletID == walletId &&
                            (t.Type == "Expense" || t.Type == "Expenses") &&
                            t.TransactionDate >= startDate &&
                            t.TransactionDate < endDate)
                .Include(t => t.Category).ThenInclude(c => c.Color)
                .GroupBy(t => new {
                    CategoryName = t.Category.CategoryName ?? "Chưa phân loại", // <-- Xử lý Category null
                    HexCode = t.Category.Color.HexCode ?? "#808080" // <-- Xử lý Color null
                })
                .Select(g => new PieChartSliceViewModel
                {
                    CategoryName = g.Key.CategoryName,
                    Amount = g.Sum(t => t.Amount),
                    ColorHex = g.Key.HexCode
                })
                .ToListAsync();

            // c. Lấy lịch sử (An toàn)
            var history = await _context.Transactions
                .Where(t => t.WalletID == walletId)
                .Include(t => t.Category).ThenInclude(c => c.Icon)
                .Include(t => t.Category).ThenInclude(c => c.Color)
                .OrderByDescending(t => t.TransactionDate)
                .Take(5)
                .ToListAsync();

            // d. Gói dữ liệu lại
            return new WalletDetailsViewModel
            {
                WalletId = wallet.WalletID,
                WalletName = wallet.WalletName,
                TotalBalance = wallet.Balance,
                MonthlyExpenses = monthlyExpenses,
                ExpenseBreakdown = pieData,
                TransactionHistory = history
            };
        }

        public async Task<Wallet> GetWalletByIdAsync(int walletId, string userId)
        {
            return await _context.Wallets
                .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);
        }

        public async Task<bool> UpdateWalletAsync(int walletId, CreateWalletViewModel model, string userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

            if (wallet == null) return false;

            // Khi sửa, cũng tự động cập nhật Icon
            wallet.Icon = GetIconForWalletType(model.WalletType);
            wallet.WalletName = model.WalletName;
            wallet.WalletType = model.WalletType;
            wallet.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteWalletAsync(int walletId, string userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

            if (wallet == null) return false;
            try
            {
                _context.Wallets.Remove(wallet);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                return false;
            }
        }
    }
}