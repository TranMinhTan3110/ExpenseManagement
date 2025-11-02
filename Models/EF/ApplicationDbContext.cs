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
        public DbSet<User> Users { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }


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
                      .HasMaxLength(500);

                entity.Property(e => e.Address)
                      .HasMaxLength(255);

                entity.Property(e => e.City)
                      .HasMaxLength(100);

                entity.Property(e => e.Country)
                      .HasMaxLength(100);

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

                entity.Property(e => e.Icon)
                      .HasMaxLength(50);

                entity.Property(e => e.Color)
                      .HasMaxLength(20);

                entity.Property(e => e.CreatedAt)
                      .HasDefaultValueSql("GETDATE()");

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Categories)
                      .HasForeignKey(e => e.UserID)
                      .OnDelete(DeleteBehavior.Cascade);
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

                entity.HasCheckConstraint("CK_GoalDeposit_Amount_Positive", "Amount > 0");

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
        }
    }
}
