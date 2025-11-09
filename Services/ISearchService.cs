using QuanLyChiTieu_WebApp.Models.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuanLyChiTieu_WebApp.Services
{
    public interface ISearchService
    {
        Task<List<Transaction>> SearchTransactionsAsync(string userId, string query);
    }
}