$(document).ready(function () {
    $("#reset_password_form").on("submit", function (e) {
        e.preventDefault();

        var newPassword = $("#newPassword").val();
        var confirmPassword = $("#confirmPassword").val();

        if (newPassword !== confirmPassword) {
            Swal.fire('Lỗi', 'Mật khẩu không khớp.', 'error');
            return;
        }

        var formData = $(this).serialize(); // Gói toàn bộ form (gồm cả token ẩn)
        var actionUrl = $(this).attr("action");

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: formData,
            dataType: "json",
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message,
                    }).then(function () {
                        // Chuyển về trang đăng nhập
                        window.location.href = '/Login/Index';
                    });
                } else {
                    Swal.fire('Thất bại', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ.', 'error');
            }
        });
    });
});