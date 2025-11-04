$(document).ready(function () {
    $("#reset_form").on("submit", function (e) {
        e.preventDefault();
        var email = $("#email").val().trim();
        var actionUrl = $(this).attr("action");

        if (!email) {
            Swal.fire('Thiếu thông tin', 'Vui lòng nhập email.', 'warning');
            return;
        }

        // --- 1. HIỆN LOADER ---
        $("#loader-overlay").show();

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: { email: email },
            dataType: "json",
            success: function (response) {
                // --- 2. ẨN LOADER ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đã gửi yêu cầu',
                        text: response.message,
                    });
                } else {
                    Swal.fire('Lỗi', response.message, 'error');
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