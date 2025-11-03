using Microsoft.AspNetCore.Mvc;
using QuanLyChiTieu_WebApp.Models.Entities;
using QuanLyChiTieu_WebApp.ViewModels;
using QuanLyChiTieu_WebApp.Services;
using System.Security.Claims; // Cần dùng Claims
using Microsoft.AspNetCore.Authentication; // Cần dùng Authentication
using Microsoft.AspNetCore.Authentication.Cookies; // Cần dùng Cookie
using Microsoft.AspNetCore.Authorization;
using QuanLyChiTieu_WebApp.Helpers;

namespace QuanLyChiTieu_WebApp.Controllers
{
    public class LoginController : Controller
    {
        private readonly ILoginServices _loginServices;
        private readonly IEmailService _emailService; 

        public LoginController(ILoginServices loginServices, IEmailService emailService)
        {
            _loginServices = loginServices;
            _emailService = emailService; 
        }

        // [GET] /Login/Index (Không đổi)
        [AllowAnonymous]
        [HttpGet]
        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
            {
                return RedirectToAction("Index", "DashBoard");
            }
            return View("SignIn");
        }

        // [POST] /Login/LoginToSystem (AJAX)
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> LoginToSystem([FromForm] string username, [FromForm] string password)
        {
            try
            {
                // 1. Gọi service để xác thực
                var user = await _loginServices.AuthenticateAsync(username, password);

                if (user == null)
                {
                    // Trả về lỗi chung chung
                    return Json(new { status = WebConstants.ERROR, message = "Email hoặc mật khẩu không chính xác." });
                }

                // 2. TẠO COOKIE (Controller tự làm)
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserID),
                    new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                };
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                var authProperties = new AuthenticationProperties { AllowRefresh = true };

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);

                // 3. Cập nhật LastLogin
                await _loginServices.UpdateLastLoginAsync(user);

                return Json(new { status = WebConstants.SUCCESS });
            }
            catch (Exception ex)
            {
                return Json(new { status = WebConstants.ERROR, message = "Đã xảy ra lỗi hệ thống." });
            }
        }


        // [GET] /Login/SignUp (Không đổi)
        [AllowAnonymous]
        [HttpGet]
        public IActionResult SignUp()
        {
            return View();
        }

        // [POST] /Login/SignUp (Xử lý AJAX)
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> SignUp(SignUpViewModel model)
        {
            //
            if (!ModelState.IsValid)
            {
                return Json(new { status = WebConstants.ERROR, message = "Dữ liệu không hợp lệ." });
            }

            try
            {
                // 1. Kiểm tra email tồn tại
                if (await _loginServices.CheckEmailExistsAsync(model.Email))
                {
                    return Json(new { status = WebConstants.ERROR, message = "Email này đã được sử dụng." });
                }

                // 2. Đăng ký user mới
                var user = await _loginServices.RegisterUserAsync(model);

                if (user == null)
                {
                    return Json(new { status = WebConstants.ERROR, message = "Đăng ký thất bại, vui lòng thử lại." });
                }

                return Json(new { status = WebConstants.SUCCESS });
            }
            catch (Exception ex)
            {
                //
                return Json(new { status = WebConstants.ERROR, message = "Đã xảy ra lỗi hệ thống khi đăng ký." });
            }   
        }


        // [GET] /Login/Logout
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Logout()
        {
            // Controller tự xử lý SignOut
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index");
        }


        // Action Reset mật khẩu (Không đổi)
        // [GET] /Login/Reset (Bạn đã có)
        [AllowAnonymous]
        public IActionResult Reset()
        {
            return View();
        }

        // --- ACTION MỚI: XỬ LÝ AJAX TỪ Reset.cshtml ---
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Reset(string email)
        {
            try
            {
                // 1. Tạo token (nếu user tồn tại)
                var user = await _loginServices.GeneratePasswordResetTokenAsync(email);

                if (user != null)
                {
                    // 2. Tạo link đặt lại
                    // (QUAN TRỌNG: Phải dùng Request.Scheme để có http/https)
                    var resetLink = Url.Action("ResetPassword", "Login",
                        new { email = user.Email, token = user.PasswordResetToken },
                        Request.Scheme);

                    // 3. Gửi email
                    var emailBody = $"Vui lòng nhấp vào link sau để đặt lại mật khẩu: {resetLink}";
                    await _emailService.SendAsync(user.Email, "Yêu cầu đặt lại mật khẩu", emailBody);
                }

                // QUAN TRỌNG: Luôn trả về "thành công"
                // Dù email có tồn tại hay không, để tránh hacker dò email.
                return Json(new
                {
                    status = WebConstants.SUCCESS,
                    message = "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã gửi một link đặt lại mật khẩu."
                });
            }
            catch (Exception ex)
            {
                // Ghi log ex
                return Json(new { status = WebConstants.ERROR, message = "Đã xảy ra lỗi hệ thống." });
            }
        }

        // --- ACTION MỚI: HIỂN THỊ FORM ĐẶT LẠI MẬT KHẨU ---
        [AllowAnonymous]
        [HttpGet]
        public IActionResult ResetPassword(string email, string token)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Index");
            }

            // Tạo ViewModel để truyền token vào form
            var model = new ResetPasswordViewModel
            {
                Email = email,
                Token = token
            };
            return View(model);
        }

        // --- ACTION MỚI: XỬ LÝ SUBMIT MẬT KHẨU MỚI ---
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return Json(new { status = WebConstants.ERROR, message = "Dữ liệu không hợp lệ." });
            }

            if (model.NewPassword != model.ConfirmPassword)
            {
                return Json(new { status = WebConstants.ERROR, message = "Mật khẩu không khớp." });
            }

            try
            {
                var success = await _loginServices.ResetPasswordAsync(model.Email, model.Token, model.NewPassword);

                if (success)
                {
                    return Json(new { status = WebConstants.SUCCESS, message = "Đổi mật khẩu thành công! Bạn có thể đăng nhập." });
                }
                else
                {
                    return Json(new { status = WebConstants.ERROR, message = "Token không hợp lệ hoặc đã hết hạn." });
                }
            }
            catch (Exception ex)
            {
                // Ghi log ex
                return Json(new { status = WebConstants.ERROR, message = "Đã xảy ra lỗi hệ thống." });
            }
        }
        [AllowAnonymous]
        [HttpGet] // Quan trọng: Đây là [HttpGet]
        public IActionResult ExternalLogin(string provider)
        {
            // Yêu cầu ASP.NET Core chuyển hướng đến Google
            // Sau khi Google OK, nó sẽ chuyển hướng về /Dashboard/Index
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("Index", "DashBoard")
            };

            return Challenge(properties, provider);
        }
    }
}