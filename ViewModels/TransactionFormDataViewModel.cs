using QuanLyChiTieu_WebApp.Models.Entities;
using System.Collections.Generic;

namespace QuanLyChiTieu_WebApp.Models.ViewModels
{
    // Class này dùng để "gói" dữ liệu gửi ra cho form
    public class TransactionFormDataViewModel
    {
        public List<Wallet> Wallets { get; set; }
        public List<Category> Categories { get; set; }
    }
}