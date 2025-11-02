namespace QuanLyChiTieu_WebApp.Services
{
    public interface IEmailService
    {
        Task SendAsync(string toEmail, string subject, string body);
    }
}
