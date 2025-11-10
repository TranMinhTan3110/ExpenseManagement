    namespace QuanLyChiTieu_WebApp.Services
    {
    public interface IDashBoardADService
    {
        Task<int> GetAmountUsers();
        Task<int> GetAmountTransactions();
        Task<int> GetPendingTickets();
        Task<int> GetTotalTickets();
    }

}
