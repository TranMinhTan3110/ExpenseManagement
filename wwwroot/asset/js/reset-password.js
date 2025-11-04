$(document).ready(function () {
    $("#reset_password_form").on("submit", function (e) {
        e.preventDefault();

        var newPassword = $("#newPassword").val();
        var confirmPassword = $("#confirmPassword").val();
        var formData = $(this).serialize();
        var actionUrl = $(this).attr("action");

        if (newPassword !== confirmPassword) {
            Swal.fire('Lỗi', 'Mật khẩu không khớp.', 'error');
            return;
        }

        // --- 1. HIỆN LOADER ---
        $("#loader-overlay").show();

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: formData,
            dataType: "json",
            success: function (response) {
                // --- 2. ẨN LOADER ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thành công!',
                        text: response.message,
                    }).then(function () {
                        window.location.href = '/Login/Index';
                    });
                } else {
                    Swal.fire('Thất bại', response.message, 'error');
                }
            },
            error: function () {
                // --- 2. ẨN LOADER (Khi bị lỗi) ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ.', 'error');
            }
        });
    });
});