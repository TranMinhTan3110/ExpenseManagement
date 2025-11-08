$(document).ready(function () {

    // --- LOGIC CHO DATEPICKER (FORM 3) ---
    // Đảm bảo thư viện flatpickr đã được nhúng
    flatpickr("#datepicker", {
        wrap: true, // Bắt buộc vì bạn dùng input-group
        altInput: true,                 // (Bắt buộc) Tạo một ô input ảo cho người dùng xem
        altFormat: "d-m-Y",             // (Hiển thị) Định dạng "25-11-2025" cho người dùng
        dateFormat: "Y-m-d",
    });

    // --- LOGIC CHO NÚT "CON MẮT" (FORM 2) ---
    $("#toggle-current-password").on("click", function () {
        var passwordInput = $("#current-password");
        var icon = $(this).find("i");

        if (passwordInput.attr("type") === "password") {
            passwordInput.attr("type", "text");
            icon.removeClass("fa-eye").addClass("fa-eye-slash");
        } else {
            passwordInput.attr("type", "password");
            icon.removeClass("fa-eye-slash").addClass("fa-eye");
        }
    });

    // --- LOGIC AJAX CHO FORM 2 (SECURITY) ---
    $("#security-form").on("submit", function (e) {
        e.preventDefault();
        var form = $(this);
        var actionUrl = form.attr("action");
        var formData = form.serialize();

        $.ajax({
            type: "POST",
            url: actionUrl,
            data: formData,
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    Swal.fire('Thành công!', response.message, 'success')
                        .then(() => {
                            // Tải lại trang để cập nhật email ở Form 1
                            window.location.reload();
                        });
                } else {
                    Swal.fire('Thất bại', response.message, 'error');
                }
            },
            error: function () {
                Swal.fire('Lỗi!', 'Không thể kết nối đến máy chủ.', 'error');
            }
        });
    });
    $("#customFile").on("change", function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                // Hiển thị ảnh preview
                $("#avatar-preview").attr("src", e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });
});