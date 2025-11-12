    namespace QuanLyChiTieu_WebApp.Services
    {
    public interface IDashBoardADService
    {
        Task<int> GetAmountUsers();
        Task<int> GetAmountTransactions();
        Task<int> GetPendingTickets();
        Task<int> GetTotalTickets();
        Task<double> GetUserGrowthPercentage();
        Task<double> GetTransactionGrowthPercentage();
        Task<Dictionary<string, int>> GetUserChartData();
        Task<int> GetUserCountInMonth(DateTime month);
        Task<int> GetTransactionCountInMonth(DateTime month);
        Task<Dictionary<string, int>> GetUserChartDataByMonth(int year);
        Task<Dictionary<string, int>> GetUserChartDataByYear(int startYear, int numberOfYears);

    }

}
