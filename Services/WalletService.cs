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
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

            if (wallet == null) return null;

            // --- 1. LẤY NGÀY ĐĂNG KÝ CỦA USER ---
            var user = await _context.Users  // <--- Đổi từ _context.Users thành tên DbSet của bạn
                .AsNoTracking()
                .Where(u => u.UserID == userId)  // <--- Đổi từ u.Id thành u.UserID
                .Select(u => new { u.CreatedAt })  // Chỉ lấy field cần thiết
                .FirstOrDefaultAsync();

            if (user == null) return null;

            // --- 2. TÍNH THỜI GIAN ĐỘNG ---
            var now = DateTime.Now;
            DateTime startDate;
            DateTime endDate;

            // Kiểm tra có phải tháng đầu tiên không
            if (now.Year == user.CreatedAt.Year && now.Month == user.CreatedAt.Month)
            {
                // THÁNG ĐẦU: Từ ngày đăng ký → cuối tháng
                startDate = user.CreatedAt;
                endDate = new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month), 23, 59, 59);
            }
            else
            {
                // CÁC THÁNG SAU: Từ đầu tháng → hiện tại
                startDate = new DateTime(now.Year, now.Month, 1);
                endDate = now;
            }

            // --- 3. TÍNH CHI TIÊU HÀNG THÁNG ---
            var monthlyExpenses = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.WalletID == walletId &&
                            t.Type == "Expense" &&
                            t.TransactionDate >= startDate &&
                            t.TransactionDate <= endDate)
                .SumAsync(t => (decimal?)t.Amount) ?? 0m;

            // --- 4. LOAD TRANSACTIONS ---
            var allTransactionsInWallet = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.WalletID == walletId)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            // --- 5. LOAD CATEGORIES ---
            var categoryIds = allTransactionsInWallet.Select(t => t.CategoryID).Distinct().ToList();

            var allUserCategories = await _context.Categories
                .AsNoTracking()
                .Where(c => categoryIds.Contains(c.CategoryID) && c.UserID == userId)
                .Include(c => c.Icon)
                .Include(c => c.Color)
                .ToDictionaryAsync(c => c.CategoryID);

            // --- 6. PIE CHART (Cũng theo thời gian động) ---
            var transactionsForPie = allTransactionsInWallet
                .Where(t => t.Type == "Expense" &&
                            t.TransactionDate >= startDate &&
                            t.TransactionDate <= endDate);

            var pieData = transactionsForPie
                .GroupBy(t => t.CategoryID)
                .Select(g =>
                {
                    allUserCategories.TryGetValue(g.Key, out var category);
                    return new PieChartSliceViewModel
                    {
                        CategoryName = category?.CategoryName ?? "Chưa phân loại",
                        Amount = g.Sum(t => t.Amount),
                        ColorHex = category?.Color?.HexCode ?? "#808080"
                    };
                })
                .ToList();

            // --- 7. TRANSACTION HISTORY ---
            var history = allTransactionsInWallet
                .Take(5)
                .Select(t =>
                {
                    allUserCategories.TryGetValue(t.CategoryID, out var category);
                    return new Transaction
                    {
                        TransactionID = t.TransactionID,
                        Amount = t.Amount,
                        Type = t.Type,
                        TransactionDate = t.TransactionDate,
                        Description = t.Description,
                        CategoryID = t.CategoryID,
                        Category = category
                    };
                })
                .ToList();

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