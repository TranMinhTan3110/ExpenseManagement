using MailKit.Net.Smtp; // <-- Dùng MailKit
using MimeKit;
using Microsoft.Extensions.Options; // <-- Dùng IOptions
using QuanLyChiTieu_WebApp.Models; // <-- Dùng MailSettings
using MailKit.Security;

namespace QuanLyChiTieu_WebApp.Services
{
    public class EmailService : IEmailService
    {
        private readonly MailSettings _mailSettings;

        // Inject IOptions<MailSettings> để lấy thông tin từ appsettings.json
        public EmailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        // Triển khai hàm SendAsync "thật"
        public async Task SendAsync(string toEmail, string subject, string body)
        {
            var emailMessage = new MimeMessage();

            // From
            emailMessage.From.Add(new MailboxAddress(_mailSettings.DisplayName, _mailSettings.Mail));
            // To
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            // Subject
            emailMessage.Subject = subject;

            // Body (Nội dung)
            var builder = new BodyBuilder();
            builder.HtmlBody = body; // Nội dung email là HTML
            emailMessage.Body = builder.ToMessageBody();

            // Dùng MailKit để kết nối và gửi
            using (var client = new SmtpClient())
            {
                try
                {
                    // 1. Kết nối tới SMTP Host của Gmail (Port 587)
                    // SecureSocketOptions.StartTls là bắt buộc cho port 587
                    await client.ConnectAsync(_mailSettings.Host, _mailSettings.Port, SecureSocketOptions.StartTls);

                    // 2. Xác thực bằng Email và Mật khẩu ứng dụng
                    await client.AuthenticateAsync(_mailSettings.Mail, _mailSettings.Password);

                    // 3. Gửi
                    await client.SendAsync(emailMessage);
                }
                catch (Exception ex)
                {
                    // Xử lý lỗi nếu gửi thất bại
                    // (Bạn có thể ném lỗi hoặc ghi log)
                    throw new InvalidOperationException($"Không thể gửi email: {ex.Message}");
                }
                finally
                {
                    // 4. Ngắt kết nối
                    await client.DisconnectAsync(true);
                }
            }
        }
    }
}