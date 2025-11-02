$(document).ready(function () {
    // 1. Bắt sự kiện submit của form có id="login_form"
    $("#login_form").on("submit", function (e) {

        // 2. Ngăn chặn hành vi submit mặc định (tải lại trang)
        e.preventDefault();

        // 3. Thu thập dữ liệu từ form
        var username = $("#username").val();
        var password = $("#password").val();

        // (Tùy chọn: Kiểm tra trống)
        if (!username || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông tin còn thiếu',
                text: 'Vui lòng nhập cả email và mật khẩu.'
            });
            return;
        }

        // Lấy URL từ thuộc tính 'action' của form
        var actionUrl = $(this).attr("action"); // Sẽ là "/Login/LoginToSystem"

        // 4. Gửi yêu cầu AJAX bằng phương thức POST
        $.ajax({
            type: "POST",
            url: actionUrl,
            data: {
                username: username, // Gửi dữ liệu khớp với tham số của action
                password: password
            },
            // (Tùy chọn: Thêm anti-forgery token nếu bạn sử dụng)

            dataType: "json", // Kiểu dữ liệu mong đợi nhận về
            success: function (response) {
                // 5. Xử lý JSON trả về
                if (response.status === 'success') {
                    // Nếu thành công, hiển thị thông báo và chuyển hướng
                    Swal.fire({
                        icon: 'success',
                        title: 'Đăng nhập thành công!',
                        text: 'Đang chuyển hướng đến trang quản trị...',
                        timer: 1500, // Tự động đóng sau 1.5s
                        showConfirmButton: false
                    }).then(function () {
                        // Chuyển hướng đến Dashboard
                        window.location.href = '/Dashboard/Index';
                    });
                } else {
                    // Nếu thất bại, hiển thị thông báo lỗi từ SweetAlert2
                    Swal.fire({
                        icon: 'error',
                        title: 'Đăng nhập thất bại',
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