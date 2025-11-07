namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class BudgetViewModel
    {
        public int BudgetID { get; set; }
        public int CategoryID { get; set; }
        public string CategoryName { get; set; }
        public string CategoryIcon { get; set; }
        public string CategoryColor { get; set; }
        public decimal BudgetAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public int Percentage { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime CreatedAt { get; set; }


    }
}
