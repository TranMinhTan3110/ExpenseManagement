using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.EF;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels;
using System;

namespace QuanLyChiTieu_WebApp.Services
{
    public class GoalService : IGoalService
    {
        private readonly ApplicationDbContext _context;

        public GoalService(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🟢 Lấy danh sách tất cả mục tiêu của user
        public async Task<GoalsIndexViewModel> GetUserGoalsAsync(string userId)
        {
            var goals = await _context.Goals
                .Where(g => g.UserID == userId)
                .Include(g => g.GoalDeposits)
                    .ThenInclude(gd => gd.Wallet)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            var goalViewModels = goals.Select(MapToViewModel).ToList();

            return new GoalsIndexViewModel
            {
                Goals = goalViewModels,
                ActiveGoalId = goalViewModels.FirstOrDefault()?.GoalID ?? 0
            };
        }

        // 🟢 Lấy chi tiết 1 mục tiêu
        public async Task<GoalViewModel> GetGoalByIdAsync(int goalId, string userId)
        {
            var goal = await _context.Goals
                .Where(g => g.GoalID == goalId && g.UserID == userId)
                .Include(g => g.GoalDeposits)
                    .ThenInclude(gd => gd.Wallet)
                .FirstOrDefaultAsync();

            return goal == null ? null : MapToViewModel(goal);
        }

        // 🟢 Tạo mới mục tiêu
        public async Task<bool> CreateGoalAsync(CreateGoalViewModel model, string userId)
        {
            try
            {
                var goal = new Goal
                {
                    UserID = userId,
                    GoalName = model.GoalName,
                    TargetAmount = model.TargetAmount,
                    CurrentAmount = 0,
                    Status = "Đang thực hiện",
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Goals.Add(goal);
                await _context.SaveChangesAsync();

                if (model.InitialAmount > 0)
                {
                    var defaultWallet = await _context.Wallets
                        .Where(w => w.UserID == userId)
                        .OrderBy(w => w.WalletID)
                        .FirstOrDefaultAsync();

                    if (defaultWallet != null && defaultWallet.Balance >= model.InitialAmount)
                    {
                        var deposit = new GoalDeposit
                        {
                            GoalID = goal.GoalID,
                            WalletID = defaultWallet.WalletID,
                            Amount = model.InitialAmount,
                            DepositDate = DateTime.Now,
                            Note = "Số tiền ban đầu"
                        };

                        _context.GoalDeposits.Add(deposit);
                        goal.CurrentAmount = model.InitialAmount;
                        defaultWallet.Balance -= model.InitialAmount;

                        await _context.SaveChangesAsync();
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }

        // 🟢 Cập nhật mục tiêu
        public async Task<bool> UpdateGoalAsync(int goalId, CreateGoalViewModel model, string userId)
        {
            try
            {
                var goal = await _context.Goals
                    .FirstOrDefaultAsync(g => g.GoalID == goalId && g.UserID == userId);

                if (goal == null) return false;

                goal.GoalName = model.GoalName;
                goal.TargetAmount = model.TargetAmount;
                goal.UpdatedAt = DateTime.Now;

                if (goal.CurrentAmount >= goal.TargetAmount)
                    goal.Status = "Đã hoàn thành";

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // 🟢 Xóa mục tiêu (và hoàn tiền về ví nếu có)
        // 🟢 Xóa mục tiêu (và hoàn tiền về ví nếu có)
        public async Task<bool> DeleteGoalAsync(int goalId, string userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // ✅ Load Goal kèm GoalDeposits
                var goal = await _context.Goals
                    .Include(g => g.GoalDeposits)
                    .FirstOrDefaultAsync(g => g.GoalID == goalId && g.UserID == userId);

                if (goal == null)
                {
                    Console.WriteLine($"❌ Không tìm thấy Goal ID: {goalId} của User: {userId}");
                    return false;
                }

                Console.WriteLine($"🔍 Tìm thấy Goal: {goal.GoalName}, CurrentAmount: {goal.CurrentAmount:N0}");
                Console.WriteLine($"🔍 Số giao dịch: {goal.GoalDeposits.Count}");

                // ✅ Hoàn tiền về ví nếu có
                if (goal.CurrentAmount > 0 && goal.GoalDeposits.Any())
                {
                    var walletContributions = goal.GoalDeposits
                        .GroupBy(gd => gd.WalletID)
                        .Select(g => new { WalletID = g.Key, Amount = g.Sum(gd => gd.Amount) })
                        .ToList();

                    Console.WriteLine($"💰 Cần hoàn tiền cho {walletContributions.Count} ví");

                    foreach (var contribution in walletContributions)
                    {
                        var wallet = await _context.Wallets
                            .FirstOrDefaultAsync(w => w.WalletID == contribution.WalletID && w.UserID == userId);

                        if (wallet != null)
                        {
                            wallet.Balance += contribution.Amount;
                            Console.WriteLine($"✅ Hoàn {contribution.Amount:N0} VNĐ vào ví '{wallet.WalletName}' (ID: {wallet.WalletID})");
                        }
                        else
                        {
                            Console.WriteLine($"⚠️ KHÔNG tìm thấy ví ID: {contribution.WalletID}");
                        }
                    }
                }

                // ✅ XÓA TẤT CẢ GoalDeposits TRƯỚC
                if (goal.GoalDeposits.Any())
                {
                    Console.WriteLine($"🗑️ Đang xóa {goal.GoalDeposits.Count} giao dịch...");
                    _context.GoalDeposits.RemoveRange(goal.GoalDeposits);
                    await _context.SaveChangesAsync(); // ← QUAN TRỌNG: Save trước khi xóa Goal
                    Console.WriteLine($"✅ Đã xóa tất cả GoalDeposits");
                }

                // ✅ SAU ĐÓ MỚI XÓA Goal
                Console.WriteLine($"🗑️ Đang xóa Goal...");
                _context.Goals.Remove(goal);
                await _context.SaveChangesAsync();

                // ✅ Commit transaction
                await transaction.CommitAsync();
                Console.WriteLine($"✅ XÓA THÀNH CÔNG Goal ID: {goalId}");

                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"❌❌❌ LỖI DeleteGoal: {ex.Message}");
                Console.WriteLine($"❌ InnerException: {ex.InnerException?.Message}");
                Console.WriteLine($"❌ StackTrace: {ex.StackTrace}");

                // ← QUAN TRỌNG: Throw exception để Controller bắt được
                throw new Exception($"Lỗi khi xóa mục tiêu: {ex.Message}", ex);
            }
        }

        // 🟢 Nạp tiền vào mục tiêu
        public async Task<bool> DepositToGoalAsync(int goalId, int walletId, decimal amount, string note, string userId)
        {
            try
            {
                var goal = await _context.Goals.FirstOrDefaultAsync(g => g.GoalID == goalId && g.UserID == userId);
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

                if (goal == null || wallet == null || wallet.Balance < amount)
                    return false;

                _context.GoalDeposits.Add(new GoalDeposit
                {
                    GoalID = goalId,
                    WalletID = walletId,
                    Amount = amount,
                    DepositDate = DateTime.Now,
                    Note = note ?? "Gửi tiền vào mục tiêu",
                    UserID = userId
                });

                goal.CurrentAmount += amount; 
                goal.UpdatedAt = DateTime.Now;
                wallet.Balance -= amount;

                if (goal.CurrentAmount >= goal.TargetAmount)
                    goal.Status = "Đã hoàn thành";

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // 🟢 Rút tiền từ mục tiêu
        public async Task<bool> WithdrawFromGoalAsync(int goalId, int walletId, decimal amount, string note, string userId)
        {
                        try
            {
                var goal = await _context.Goals.FirstOrDefaultAsync(g => g.GoalID == goalId && g.UserID == userId);
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

                if (goal == null || wallet == null || goal.CurrentAmount < amount)
                    return false;

                _context.GoalDeposits.Add(new GoalDeposit
                {
                    GoalID = goalId,
                    WalletID = walletId,
                    Amount = -amount,
                    DepositDate = DateTime.Now,
                    Note = note ?? "Rút tiền từ mục tiêu"
                });

                goal.CurrentAmount -= amount;
                goal.UpdatedAt = DateTime.Now;
                wallet.Balance += amount;

                if (goal.CurrentAmount < goal.TargetAmount)
                    goal.Status = "Đang thực hiện";

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        // 🧩 Helper: Map từ entity sang ViewModel
        private GoalViewModel MapToViewModel(Goal goal)
        {
            var progressPercentage = goal.TargetAmount > 0
                ? (int)Math.Round((goal.CurrentAmount / goal.TargetAmount) * 100)
                : 0;

            // TÍNH TOÁN LẠI ĐÓNG GÓP CỦA TỪNG VÍ (LOGIC MỚI)
            var walletContributions = goal.GoalDeposits
                .GroupBy(gd => gd.Wallet) // Nhóm theo đối tượng Wallet
                .Select(g => new {
                    Wallet = g.Key,
                    TotalContribution = g.Sum(d => d.Amount) // Tính tổng (cả nạp và rút)
                })
                .Where(wc => wc.TotalContribution > 0) // <--- Chỉ lấy ví CÓ TIỀN trong mục tiêu
                .Select(wc => new WalletContributionViewModel
                {
                    WalletID = wc.Wallet.WalletID,          // <--- Gán WalletID
                    WalletName = wc.Wallet.WalletName,
                    WalletType = wc.Wallet.WalletType,
                    Amount = wc.TotalContribution,          // <--- Gán số tiền thực tế
                    CurrentAmount = wc.TotalContribution,
                    TargetAmount = goal.CurrentAmount,
                    IconClass = GetWalletIcon(wc.Wallet.WalletType),
                    ColorClass = GetWalletColor(wc.Wallet.WalletType)
                })
                .ToList();

            var depositHistory = goal.GoalDeposits
                .OrderByDescending(gd => gd.DepositDate)
                .Take(10)
                .Select(gd => new GoalDepositHistoryViewModel
                {
                    Date = gd.DepositDate,
                    WalletName = gd.Wallet.WalletName,
                    Description = gd.Note ?? (gd.Amount > 0 ? "Gửi tiền vào mục tiêu" : "Rút tiền từ mục tiêu"),
                    Amount = gd.Amount,
                    Balance = goal.GoalDeposits
                        .Where(d => d.DepositDate <= gd.DepositDate)
                        .Sum(d => d.Amount)
                })
                .ToList();

            var lastMonthDeposits = goal.GoalDeposits
                .Where(gd => gd.DepositDate >= DateTime.Now.AddMonths(-1) && gd.Amount > 0)
                .Sum(gd => gd.Amount);

            return new GoalViewModel
            {
                GoalID = goal.GoalID,
                GoalName = goal.GoalName,
                TargetAmount = goal.TargetAmount,
                CurrentAmount = goal.CurrentAmount,
                Status = goal.Status,
                ProgressPercentage = progressPercentage,
                RemainingAmount = goal.TargetAmount - goal.CurrentAmount,
                LastMonthSavings = lastMonthDeposits,
                WalletContributions = walletContributions,
                DepositHistory = depositHistory
            };
        }
        // 🟢 Rút tiền âm thầm (Tất toán Goal về Ví)
        // Trong file: Services/GoalService.cs
        // File: Services/GoalService.cs

        public async Task<bool> WithdrawSilentAsync(int goalId, int walletId, string userId)
        {
            // Dùng Transaction để đảm bảo an toàn (sai là hoàn tác hết)
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var goal = await _context.Goals
                    .FirstOrDefaultAsync(g => g.GoalID == goalId && g.UserID == userId);

                var wallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.WalletID == walletId && w.UserID == userId);

                if (goal == null) throw new Exception($"Không tìm thấy Goal ID {goalId}");
                if (wallet == null) throw new Exception($"Không tìm thấy Ví ID {walletId}");

                decimal amountToWithdraw = goal.CurrentAmount;
                if (amountToWithdraw <= 0) throw new Exception("Mục tiêu này đã hết tiền (0đ).");

                // 1. Cộng tiền vào ví thật
                wallet.Balance += amountToWithdraw;

                // 2. Trừ tiền Goal về 0
                goal.CurrentAmount = 0;
                goal.Status = "Đã hoàn thành"; // Cập nhật trạng thái
                goal.UpdatedAt = DateTime.Now;

                // 3. Ghi lịch sử Goal (Quan trọng: Thử ghi số dương nhưng đổi Note xem sao)
                // Nếu DB cấm số âm, dòng dưới đây sẽ gây lỗi. 
                // Tạm thời tôi để số ÂM theo ý bạn. Nếu chạy lên báo lỗi "Constraint" thì do dòng này.
                var withdrawalRecord = new GoalDeposit
                {
                    GoalID = goalId,
                    WalletID = walletId,
                    Amount = -amountToWithdraw, // <--- Nghi phạm số 1 gây lỗi
                    DepositDate = DateTime.Now,
                    Note = $"Tất toán về ví {wallet.WalletName}",
                    UserID = userId
                };
                _context.GoalDeposits.Add(withdrawalRecord);

                // 4. Lưu vào DB
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw; // Ném lỗi ra ngoài cho Controller bắt
            }
        }
        private string GetWalletIcon(string walletType) => walletType?.ToLower() switch
        {
            "bank" => "fi fi-rr-bank",
            "cash" => "fi fi-rr-money-bills-simple",
            "card" => "fi fi-rr-credit-card",
            _ => "fi fi-rr-wallet"
        };

        private string GetWalletColor(string walletType) => walletType?.ToLower() switch
        {
            "bank" => "bg-yellow-500",
            "cash" => "bg-indigo-500",
            "card" => "bg-purple-500",
            _ => "bg-blue-500"
        };
    }
}
