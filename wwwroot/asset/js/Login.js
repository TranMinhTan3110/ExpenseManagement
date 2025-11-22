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
// LOGIN FORM SUBMISSION
// ====================================
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
                        window.location.href = response.redirect;
                    });
                } else {
                    // Kiểm tra xem có phải lỗi do "bị khóa" không
                    if (response.message && response.message.includes("khóa")) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Tài khoản bị khóa!',
                            text: response.message
                        });
                    }
                    // Nếu không phải lỗi "bị khóa", thì đó là lỗi sai pass/email
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Đăng nhập thất bại',
                            text: response.message
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