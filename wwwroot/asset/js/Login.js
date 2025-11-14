$(document).ready(function () {
    $("#login_form").on("submit", function (e) {
        e.preventDefault();
        var username = $("#username").val().trim();
        var password = $("#password").val();
        var actionUrl = $(this).attr("action");

        $("#loader-overlay").show();

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: {
                username: username,
                password: password
            },
            dataType: "json",
            success: function (response) {
                $("#loader-overlay").hide();

                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đăng nhập thành công!',
                        text: 'Đăng nhập thành công!',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(function () {

                        // ✅ DÙNG REDIRECT TỪ SERVER
                        window.location.href = response.redirect;

                    });
                } else {
                    // 1. Kiểm tra xem có phải lỗi do "bị khóa" không
                    // (Chúng ta tìm chữ "khóa" trong message trả về)
                    if (response.message && response.message.includes("khóa")) {
                        Swal.fire({
                            icon: 'warning', // Đổi icon thành cảnh báo
                            title: 'Tài khoản bị khóa!', // Tiêu đề rõ ràng
                            text: response.message // Hiển thị message từ server
                        });
                    }
                    // 2. Nếu không phải lỗi "bị khóa", thì đó là lỗi sai pass/email
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Đăng nhập thất bại',
                            text: response.message // Hiển thị "Email hoặc mật khẩu không chính xác."
                        });
                    }
                }
            },
            error: function () {
                $("#loader-overlay").hide();

                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
                });
            }
        });
    });
});
