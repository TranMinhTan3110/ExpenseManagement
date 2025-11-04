$(document).ready(function () {
    $("#signup_form").on("submit", function (e) {
        e.preventDefault();

        var fullName = $("#fullName").val().trim();
        var email = $("#email").val().trim();
        var password = $("#password").val();
        var confirmPassword = $("#confirmPassword").val();
        var actionUrl = $(this).attr("action");

        // (Validation của bạn ở đây: kiểm tra trống, khớp mật khẩu...)
        if (password !== confirmPassword) {
            Swal.fire('Lỗi', 'Mật khẩu không khớp.', 'error');
            return;
        }

        // --- 1. HIỆN LOADER ---
        $("#loader-overlay").show();

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: {
                FullName: fullName,
                Email: email,
                Password: password
            },
            dataType: "json",
            success: function (response) {
                // --- 2. ẨN LOADER ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đăng ký thành công!',
                        text: 'Đang chuyển hướng đến trang đăng nhập...',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(function () {
                        window.location.href = '/Login/Index';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng ký thất bại',
                        text: response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                // --- 2. ẨN LOADER (Khi bị lỗi) ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.'
                });
            }
        });
    });
});