using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.Models.ViewModels;
using QuanLyChiTieu_WebApp.ViewModels;

namespace QuanLyChiTieu_WebApp.Services
{
    public class TransactionService : ITransactionService
    {
        ApplicationDbContext _context;
        public TransactionService(ApplicationDbContext context) {
            _context =context;
        }
        public  async Task CreateTransactionAsync(CreateTransactionViewModel model, string userId)
        {
            //lấy ví user chọn
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletID == model.WalletID && w.UserID == userId);
            if (wallet == null)
            {
                
                throw new Exception("Không tìm thấy ví hoặc bạn không có quyền.");
            }
            var  newTransaction = new Transaction
            {
                UserID = userId,
                WalletID = model.WalletID,
                CategoryID = model.CategoryID,
                Amount = model.Amount,
                Type = model.Type,
                Description = model.Description,
                TransactionDate = model.TransactionDate,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            // Bước 3: Cập nhật số dư (Logic quan trọng)
            if (model.Type == "Income")
            {
                wallet.Balance += model.Amount; // Cộng tiền vào ví
            }
            else // (Nếu là "Expense")
            {
                // Kiểm tra xem có đủ tiền không
                if (wallet.Balance < model.Amount)
                {
                    throw new Exception("Số dư trong ví không đủ.");
                }
                wallet.Balance -= model.Amount; // Trừ tiền khỏi ví
            }
            wallet.UpdatedAt = DateTime.Now;
            //luu vô db
            _context.Transactions.Add(newTransaction);
            await _context.SaveChangesAsync();
        }

        public  async Task<List<Category>> GetCategoriesByTypeAsync(string type, string userId)
        {
           return await  _context.Categories.Where(t => t.Type == type && t.UserID == userId)
                .Include(c => c.Icon) 
                .Include(c => c.Color) 
                .ToListAsync();
        }

        //load dữ liệu cần thiết cho form giao dịch
        public  async Task<TransactionFormDataViewModel> GetFormDataAsync(string userId)
        {
            var wallets =  await _context.Wallets.Where(t => t.UserID == userId).ToListAsync();
            // Lấy danh sách category mặc định (là "Expense")
            var categories = await _context.Categories
                .Where(c => c.UserID == userId && (c.Type == "Expense" || c.Type == "Expenses"))
                .Include(c => c.Icon) // Lấy kèm Icon
                .Include(c => c.Color) // Lấy kèm Color
                .ToListAsync();
            return new TransactionFormDataViewModel
            {
                Wallets = wallets,
                Categories = categories
            };
        }
    }
}
