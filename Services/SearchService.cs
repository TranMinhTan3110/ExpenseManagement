using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;

        public SearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Transaction>> SearchTransactionsAsync(string userId, string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return new List<Transaction>(); // Trả về rỗng nếu không tìm gì
            }

            var lowerQuery = query.ToLower();

            var results = await _context.Transactions
                .Include(t => t.Wallet)
                .Include(t => t.Category)         // Lấy Category
                    .ThenInclude(c => c.Icon)     // ...rồi lấy Icon BÊN TRONG Category
                .Include(t => t.Category)         // Lấy Category (lần nữa để lấy Color)
                    .ThenInclude(c => c.Color)    // ...rồi lấy Color BÊN TRONG Category
                .Where(t => t.UserID == userId &&
                            (
                                (t.Description != null && t.Description.ToLower().Contains(lowerQuery)) ||
                                (t.Category != null && t.Category.CategoryName.ToLower().Contains(lowerQuery)) ||
                                (t.Wallet != null && t.Wallet.WalletName.ToLower().Contains(lowerQuery))
                            ))
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();

            return results;
        }
    }
}