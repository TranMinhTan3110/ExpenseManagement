using System;
using System.Collections.Generic;
using QuanLyChiTieu_WebApp.Models.Entities; // Cần dùng Ticket

namespace QuanLyChiTieu_WebApp.ViewModels
{
    // Đây là 1 ViewModel "cha" chứa danh sách các ticket
    public class SupportViewModel
    {
        public List<Ticket> MyTickets { get; set; } = new List<Ticket>();

        //có thể thêm List<Ticket> RecentTickets ở đây
    }
}