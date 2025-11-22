using Microsoft.EntityFrameworkCore;
using QuanLyChiTieu_WebApp.Models.Entities;

namespace QuanLyChiTieu_WebApp.Models.EF
{
    public class ApplicationDbContext: DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
             : base(options)
        {
        }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<GoalDeposit> GoalDeposits { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Wallet> Wallets { get; set; }  
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Icon> Icons { get; set; }
        public DbSet<Color> Colors { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Gọi hàm base trước
            base.OnModelCreating(modelBuilder);

            //--------------------------Ticket-------------------
            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.HasKey(e => e.TicketID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.QuestionType)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.RespondType)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.Description)
                      .IsRequired();

                entity.Property(e => e.Status)
                      .HasMaxLength(20)
                      .HasDefaultValue("Open");

                entity.HasCheckConstraint("CK_Ticket_Status", "Status IN ('Open','Pending','Resolved')");

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Tickets)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            //--------------------------NOTIFICATION (THÊM MỚI)-------------------
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.NotificationID);

                entity.Property(e => e.UserId)
                      .IsRequired()
                      .HasMaxLength(450); // Giống với UserID trong Ticket

                entity.Property(e => e.Message)
                      .IsRequired()
                      .HasMaxLength(500);

                entity.Property(e => e.Url)
                      .HasMaxLength(255); // Cho phép null

                entity.Property(e => e.IsRead)
                      .HasDefaultValue(false);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                // Thiết lập mối quan hệ: Một User có nhiều Notification
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Notifications) // <-- XEM BƯỚC 3
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade); // Xóa noti khi user bị xóa
            });
            //-----------------User--------------------
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserID);

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(256);

                entity.HasIndex(e => e.Email)
                      .IsUnique();

                entity.Property(e => e.PasswordHash)
                      .IsRequired();

                entity.Property(e => e.FullName)
                      .HasMaxLength(150);

                entity.Property(e => e.AvatarUrl)
                      .HasMaxLength(500)
                      .IsRequired(false);

                entity.Property(e => e.Address)
                      .HasMaxLength(255)
                      .IsRequired(false);

                entity.Property(e => e.City)
                      .HasMaxLength(100)
                      .IsRequired(false);

                entity.Property(e => e.Country)
                      .HasMaxLength(100)
                      .IsRequired(false);

                entity.Property(e => e.Role)
                      .HasMaxLength(20)
                      .HasDefaultValue("User");

                entity.Property(e => e.IsActive)
                      .HasDefaultValue(true);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");
            });

            //--------------------------Wallet-------------------------------
            modelBuilder.Entity<Wallet>(entity =>
            {
                entity.HasKey(e => e.WalletID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.WalletName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.WalletType)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.Icon)
                      .HasMaxLength(100);

                entity.Property(e => e.InitialBalance)
                      .HasColumnType("decimal(15,2)")
                      .HasDefaultValue(0);

                entity.Property(e => e.Balance)
                      .HasColumnType("decimal(15,2)")
                      .HasDefaultValue(0);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Wallets)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //--------------Budget----------------------
            modelBuilder.Entity<Budget>(entity =>
            {
                entity.HasKey(e => e.BudgetID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.CategoryID)
                      .IsRequired();

                entity.Property(e => e.BudgetAmount)
                      .IsRequired()
                      .HasColumnType("decimal(18,2)");

                entity.Property(e => e.StartDate)
                      .IsRequired();

                entity.Property(e => e.EndDate)
                      .IsRequired();

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(b => b.IsRecurring)
                      .HasDefaultValue(false);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Budgets)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Budgets)
                      .HasForeignKey(e => e.CategoryID)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            //------------Category----------------------
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.CategoryID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.CategoryName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Type)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                // Giữ nguyên liên kết với User
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Categories)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);

                // --- THÊM 2 LIÊN KẾT MỚI ---

                // 1. Liên kết Category -> Icon
                entity.HasOne(c => c.Icon)
                      .WithMany() // Một Icon có thể được nhiều Category dùng
                      .HasForeignKey(c => c.IconID)
                      .OnDelete(DeleteBehavior.NoAction); // Không cho xóa Icon nếu đang được dùng

                // 2. Liên kết Category -> Color
                entity.HasOne(c => c.Color)
                      .WithMany() // Một Color có thể được nhiều Category dùng
                      .HasForeignKey(c => c.ColorID)
                      .OnDelete(DeleteBehavior.NoAction); // Không cho xóa Color nếu đang được dùng
            });

            //--------------------Goal----------------------
            modelBuilder.Entity<Goal>(entity =>
            {
                entity.HasKey(e => e.GoalID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.GoalName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.TargetAmount)
                      .IsRequired()
                      .HasColumnType("decimal(18,2)")
                      .HasDefaultValue(0);

                entity.Property(e => e.CurrentAmount)
                      .HasColumnType("decimal(18,2)")
                      .HasDefaultValue(0);

                entity.Property(e => e.Status)
                      .HasMaxLength(20)
                      .HasDefaultValue("Đang thực hiện");

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Goals)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            //-----------------Transaction--------------------
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasKey(e => e.TransactionID);

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.Type)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.HasCheckConstraint("CK_Transaction_Type", "Type IN (N'Expense', N'Income')");

                entity.Property(e => e.Amount)
                      .IsRequired()
                      .HasColumnType("decimal(18,2)");

                entity.HasCheckConstraint("CK_Transaction_Amount_Positive", "Amount > 0");

                entity.Property(e => e.TransactionDate)
                      .IsRequired();

                entity.Property(e => e.Description)
                      .HasMaxLength(255);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.UpdatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Transactions)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Wallet)
                      .WithMany(w => w.Transactions)
                      .HasForeignKey(e => e.WalletID)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Transactions)
                      .HasForeignKey(e => e.CategoryID)
                      .OnDelete(DeleteBehavior.NoAction);
            });

            //----------------GoalDeposit-------------------------
            modelBuilder.Entity<GoalDeposit>(entity =>
            {
                entity.HasKey(e => e.DepositID);

                entity.Property(e => e.GoalID)
                      .IsRequired();

                entity.Property(e => e.UserID)
                      .IsRequired()
                      .HasMaxLength(450);

                entity.Property(e => e.WalletID)
                      .IsRequired();

                entity.Property(e => e.Amount)
                      .IsRequired()
                      .HasColumnType("decimal(18,2)");

                //entity.HasCheckConstraint("CK_GoalDeposit_Amount_Positive", "Amount > 0");

                entity.Property(e => e.DepositDate)
                      .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.Note)
                      .HasMaxLength(255);

                entity.HasOne(e => e.Goal)
                      .WithMany(g => g.GoalDeposits)
                      .HasForeignKey(e => e.GoalID)
                      .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(e => e.User)
                      .WithMany(u => u.GoalDeposits)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Wallet)
                      .WithMany(w => w.GoalDeposits)
                      .HasForeignKey(e => e.WalletID)
                      .OnDelete(DeleteBehavior.NoAction);
            });
            // --- GIEO MẦM DỮ LIỆU CHO 30 ICON HỆ THỐNG ---
            modelBuilder.Entity<Icon>().HasData(
                // Chi tiêu cơ bản
                new Icon { IconID = 1, IconName = "Ăn uống", IconClass = "fa-solid fa-utensils" },
                new Icon { IconID = 2, IconName = "Đi lại", IconClass = "fa-solid fa-bus-simple" },
                new Icon { IconID = 3, IconName = "Xăng xe", IconClass = "fa-solid fa-gas-pump" },
                new Icon { IconID = 4, IconName = "Hóa đơn", IconClass = "fa-solid fa-file-invoice-dollar" },
                new Icon { IconID = 5, IconName = "Thuê nhà", IconClass = "fa-solid fa-house-user" },
                new Icon { IconID = 6, IconName = "Mua sắm", IconClass = "fa-solid fa-shirt" },
                new Icon { IconID = 7, IconName = "Tạp hóa", IconClass = "fa-solid fa-cart-shopping" },
                new Icon { IconID = 8, IconName = "Sửa chữa", IconClass = "fa-solid fa-screwdriver-wrench" },

                // Cá nhân & Giải trí
                new Icon { IconID = 9, IconName = "Sức khỏe", IconClass = "fa-solid fa-heart-pulse" },
                new Icon { IconID = 10, IconName = "Giáo dục", IconClass = "fa-solid fa-graduation-cap" },
                new Icon { IconID = 11, IconName = "Giải trí", IconClass = "fa-solid fa-film" },
                new Icon { IconID = 12, IconName = "Thể thao", IconClass = "fa-solid fa-dumbbell" },
                new Icon { IconID = 13, IconName = "Làm đẹp", IconClass = "fa-solid fa-wand-magic-sparkles" },
                new Icon { IconID = 14, IconName = "Cà phê", IconClass = "fa-solid fa-mug-hot" },
                new Icon { IconID = 15, IconName = "Du lịch", IconClass = "fa-solid fa-plane-departure" },
                new Icon { IconID = 16, IconName = "Sở thích", IconClass = "fa-solid fa-palette" },

                // Gia đình & Bạn bè
                new Icon { IconID = 17, IconName = "Quà tặng", IconClass = "fa-solid fa-gift" },
                new Icon { IconID = 18, IconName = "Con cái", IconClass = "fa-solid fa-child-reaching" },
                new Icon { IconID = 19, IconName = "Thú cưng", IconClass = "fa-solid fa-paw" },

                // Tài chính & Thu nhập
                new Icon { IconID = 20, IconName = "Lương", IconClass = "fa-solid fa-money-bill-wave" },
                new Icon { IconID = 21, IconName = "Kinh doanh", IconClass = "fa-solid fa-briefcase" },
                new Icon { IconID = 22, IconName = "Đầu tư", IconClass = "fa-solid fa-arrow-trend-up" },
                new Icon { IconID = 23, IconName = "Tiết kiệm", IconClass = "fa-solid fa-piggy-bank" },
                new Icon { IconID = 24, IconName = "Thu nhập phụ", IconClass = "fa-solid fa-sack-dollar" },
                new Icon { IconID = 25, IconName = "Bảo hiểm", IconClass = "fa-solid fa-shield-halved" },
                new Icon { IconID = 26, IconName = "Ngân hàng", IconClass = "fa-solid fa-building-columns" },

                // Khác
                new Icon { IconID = 27, IconName = "Cửa hàng", IconClass = "fa-solid fa-store" },
                new Icon { IconID = 28, IconName = "Điện thoại", IconClass = "fa-solid fa-mobile-screen-button" },
                new Icon { IconID = 29, IconName = "Internet", IconClass = "fa-solid fa-wifi" },
                new Icon { IconID = 30, IconName = "Khác", IconClass = "fa-solid fa-ellipsis" }
            );
            // --- GIEO MẦM DỮ LIỆU CHO 20 MÀU HỆ THỐNG ---
            modelBuilder.Entity<Color>().HasData(
                new Color { ColorID = 1, ColorName = "Red", HexCode = "#ef4444" },        // Đỏ
                new Color { ColorID = 2, ColorName = "Orange", HexCode = "#f97316" },     // Cam
                new Color { ColorID = 3, ColorName = "Amber", HexCode = "#f59e0b" },      // Vàng (Giống ví dụ của bạn)
                new Color { ColorID = 4, ColorName = "Yellow", HexCode = "#eab308" },     // Vàng-chanh
                new Color { ColorID = 5, ColorName = "Lime", HexCode = "#84cc16" },       // Xanh-lá-mạ
                new Color { ColorID = 6, ColorName = "Green", HexCode = "#22c55e" },      // Xanh-lá (Giống ví dụ của bạn)
                new Color { ColorID = 7, ColorName = "Emerald", HexCode = "#10b981" },    // Xanh-ngọc-bích
                new Color { ColorID = 8, ColorName = "Teal", HexCode = "#14b8a6" },       // Xanh-mòng-két
                new Color { ColorID = 9, ColorName = "Cyan", HexCode = "#06b6d4" },       // Xanh-lơ
                new Color { ColorID = 10, ColorName = "Sky", HexCode = "#0ea5e9" },       // Xanh-da-trời
                new Color { ColorID = 11, ColorName = "Blue", HexCode = "#3b82f6" },      // Xanh-dương
                new Color { ColorID = 12, ColorName = "Indigo", HexCode = "#6366f1" },    // Xanh-chàm
                new Color { ColorID = 13, ColorName = "Violet", HexCode = "#8b5cf6" },    // Tím-Violet
                new Color { ColorID = 14, ColorName = "Purple", HexCode = "#a855f7" },    // Tím
                new Color { ColorID = 15, ColorName = "Fuchsia", HexCode = "#d946ef" },   // Tím-hồng
                new Color { ColorID = 16, ColorName = "Pink", HexCode = "#ec4899" },      // Hồng
                new Color { ColorID = 17, ColorName = "Rose", HexCode = "#f43f5e" },      // Hồng-đậm
                new Color { ColorID = 18, ColorName = "Slate", HexCode = "#64748b" },     // Xám-xanh
                new Color { ColorID = 19, ColorName = "Gray", HexCode = "#9ca3af" },      // Xám
                new Color { ColorID = 20, ColorName = "Stone", HexCode = "#a8a29e" }      // Xám-đá
            );
        }
    }
}
