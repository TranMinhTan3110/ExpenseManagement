// ====================================
// TOGGLE PASSWORD VISIBILITY
// ====================================
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + '-eye');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fi-rr-eye');
        icon.classList.add('fi-rr-eye-crossed');
    } else {
        input.type = 'password';
        icon.classList.remove('fi-rr-eye-crossed');
        icon.classList.add('fi-rr-eye');
    }
}

// ====================================
// SIGNUP FORM SUBMISSION
// ====================================
$(document).ready(function () {
    $("#signup_form").on("submit", function (e) {
        e.preventDefault();

        var fullName = $("#fullName").val().trim();
        var email = $("#email").val().trim();
        var password = $("#password").val();
        var confirmPassword = $("#confirmPassword").val();
        var actionUrl = $(this).attr("action");

        // Validation: kiểm tra trống
        if (!fullName || !email || !password || !confirmPassword) {
            Swal.fire('Lỗi', 'Vui lòng điền đầy đủ thông tin.', 'error');
            return;
        }

        // Validation: kiểm tra khớp mật khẩu
        if (password !== confirmPassword) {
            Swal.fire('Lỗi', 'Mật khẩu không khớp.', 'error');
            return;
        }

        // Validation: kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            Swal.fire('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
            return;
        }

        // Hiện loader
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
                $("#loader-overlay").hide();

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