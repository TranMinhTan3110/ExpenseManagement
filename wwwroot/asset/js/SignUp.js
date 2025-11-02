$(document).ready(function () {
    // 1. Bắt sự kiện submit của form có id="signup_form"
    $("#signup_form").on("submit", function (e) {

        // 2. Ngăn chặn hành vi submit mặc định (tải lại trang)
        e.preventDefault();

        // 3. Thu thập dữ liệu từ form
        var fullName = $("#fullName").val();
        var email = $("#email").val();
        var password = $("#password").val();
        var confirmPassword = $("#confirmPassword").val();

        // 4. Kiểm tra (Validate) phía client
        if (!fullName || !email || !password || !confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông tin còn thiếu',
                text: 'Vui lòng điền đầy đủ các trường.'
            });
            return; // Dừng lại
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Mật khẩu không khớp',
                text: 'Mật khẩu và mật khẩu nhập lại không giống nhau.'
            });
            return; // Dừng lại
        }

        // Lấy URL từ thuộc tính 'action' của form
        var actionUrl = $(this).attr("action"); // Sẽ là "/Login/SignUp"

        // 5. Gửi yêu cầu AJAX bằng phương thức POST
        $.ajax({
            type: "POST",
            url: actionUrl,
            // Gửi dữ liệu khớp với các thuộc tính của SignUpViewModel
            data: {
                FullName: fullName,
                Email: email,
                Password: password
            },
            dataType: "json", // Kiểu dữ liệu mong đợi nhận về
            success: function (response) {
                // 6. Xử lý JSON trả về
                if (response.status === 'success') {
                    // Nếu thành công
                    Swal.fire({
                        icon: 'success',
                        title: 'Đăng ký thành công!',
                        text: 'Đang chuyển hướng đến trang đăng nhập...',
                        timer: 2000, // Tự động đóng sau 2s
                        showConfirmButton: false
                    }).then(function () {
                        // Chuyển hướng đến trang đăng nhập
                        window.location.href = '/Login/Index';
                    });
                } else {
                    // Nếu thất bại (ví dụ: email đã tồn tại)
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng ký thất bại',
                        text: response.message // Hiển thị thông báo lỗi từ controller
                    });
                }
            },
            error: function (xhr, status, error) {
                // Xử lý lỗi AJAX (ví dụ: mất kết nối, lỗi 500)
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
                });
            }
        });
    });
});