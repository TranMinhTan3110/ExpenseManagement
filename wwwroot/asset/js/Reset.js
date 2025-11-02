$(document).ready(function () {
    $("#reset_form").on("submit", function (e) {
        e.preventDefault();
        var email = $("#email").val().trim();

        if (!email) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập email.', 'warning');
            return;
        }

        var actionUrl = $(this).attr("action");

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: { email: email },
            dataType: "json",
            success: function (response) {
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã gửi yêu cầu',
                        text: response.message, // Lấy thông báo từ controller
                    });
                } else {
                    Swal.fire('Lỗi', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ.', 'error');
            }
        });
    });
});