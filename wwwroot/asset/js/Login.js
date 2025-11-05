$(document).ready(function () {
    $("#login_form").on("submit", function (e) {
        e.preventDefault();
        var username = $("#username").val().trim();
        var password = $("#password").val();
        var actionUrl = $(this).attr("action");

        // (Validation của bạn ở đây...)

        // --- 1. HIỆN LOADER ---
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
                // --- 2. ẨN LOADER ---
                $("#loader-overlay").hide();

                // 3. Hiện SweetAlert
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Đăng nhập thành công!',
                        text: 'Đăng nhập thành công!',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(function () {
                        window.location.href = '/Dashboard/Index';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng nhập thất bại',
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