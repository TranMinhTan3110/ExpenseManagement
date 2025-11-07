$(document).ready(function () {

    // ✅ Khởi tạo flatpickr khi modal mở
    $('#addGoalModal').on('shown.bs.modal', function () {
        flatpickr("#goal-datepicker", {
            wrap: true,
            dateFormat: "d-m-Y",
        });
    });

    // 🟩 Thêm mục tiêu
    $('#addGoalForm').on('submit', function (e) {
        e.preventDefault();

        const dateInput = $('#goalTargetDateInput').val();
        let formattedDate = null;
        if (dateInput) {
            const parts = dateInput.split('-');
            if (parts.length === 3) {
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-MM-dd
            }
        }

        const data = {
            GoalName: $('#goalNameInput').val(),
            TargetAmount: parseFloat($('#goalTargetAmountInput').val()),
            TargetDate: formattedDate,
            InitialAmount: parseFloat($('#goalInitialAmountInput').val()) || 0
        };

        console.log("🧩 Dữ liệu gửi:", data);

        $.ajax({
            url: '/Goals/Create',  // Sử dụng URL tĩnh
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    $('#addGoalModal').modal('hide');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                toastr.error('Có lỗi xảy ra. Vui lòng thử lại!');
            }
        });
    });

    // Reset form thêm mục tiêu
    $('#addGoalModal').on('hidden.bs.modal', function () {
        $('#addGoalForm')[0].reset();
    });

    // 🟢 Khi click nút "Nạp tiền", lưu GoalID vào modal
    $(document).on('click', '[data-bs-target="#depositModal"]', function () {
        const goalId = $(this).data('goal-id');
        $('#depositGoalId').val(goalId);

        // Reset form
        $('#depositForm')[0].reset();
        $('#depositGoalId').val(goalId);
    });

    


    $(document).ready(function () {
        // ========== QUAN TRỌNG: Bind event cho modal ==========
        const modalElement = document.getElementById('depositModal');

        if (modalElement) {
            console.log('✅ Tìm thấy modal element');

            // Cách 1: Dùng vanilla JS (ưu tiên)
            modalElement.addEventListener('show.bs.modal', function (event) {
                console.log('🎯 EVENT TRIGGERED - Modal đang mở!');
                loadWalletsToDropdown();
            });

            // Cách 2: Dùng jQuery (backup)
            $('#depositModal').on('show.bs.modal', function (event) {
                console.log('🎯 JQUERY EVENT - Modal đang mở!');
            });

        } else {
            console.error('❌ KHÔNG tìm thấy modal element!');
        }

        // Submit form
        $('#depositForm').on('submit', function (e) {
            e.preventDefault();
            console.log('📤 Form submitted');

            const walletId = $('#depositWallet').val();
            const amount = $('#depositAmount').val();

            if (!walletId) {
                toastr.error('Vui lòng chọn ví');
                return;
            }

            if (!amount || amount < 1000) {
                toastr.error('Số tiền tối thiểu 1,000 VNĐ');
                return;
            }

            console.log('✅ Validation passed', { walletId, amount });
            // TODO: Call API để nạp tiền
        });
    });

    // ========== HÀM LOAD VÍ ==========
    function loadWalletsToDropdown() {
  

        const $select = $('#depositWallet');

        // Show loading
        $select.html('<option>⏳ Đang tải...</option>');
        $select.prop('disabled', true);

        $.ajax({
            url: '/Goals/GetUserWallets',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log('✅ AJAX Success:', response);

                $select.prop('disabled', false);
                $select.empty();
                $select.append('<option value="">-- Chọn ví --</option>');

                if (response.success && response.data && response.data.length > 0) {
                    response.data.forEach(function (wallet) {
                        const id = wallet.walletID || wallet.WalletID;
                        const name = wallet.walletName || wallet.WalletName;
                        const balance = wallet.balance || wallet.Balance || '0';

                        $select.append(
                            `<option value="${id}">${name} - ${balance} VNĐ</option>`
                        );

                        console.log(`➕ Added: ${name} (${id})`);
                    });

                    toastr.success(`Đã tải ${response.data.length} ví`);
                } else {
                    $select.append('<option value="">Chưa có ví nào</option>');
                    toastr.warning('Vui lòng tạo ví trước');
                }
            },
            error: function (xhr, status, error) {
                console.error('❌ AJAX Error:', xhr.status, xhr.responseText);

                $select.prop('disabled', false);
                $select.html('<option value="">❌ Lỗi tải ví</option>');

                toastr.error('Không thể tải danh sách ví');
            }
        });
    }



    // 🟢 Submit form nạp tiền
    $('#depositForm').on('submit', function (e) {
        e.preventDefault();

        const goalId = parseInt($('#depositGoalId').val());
        const walletId = parseInt($('#depositWallet').val());
        const amount = parseFloat($('#depositAmount').val());
        const note = $('#depositNote').val() || '';

        // Validate
        if (!walletId) {
            toastr.error('Vui lòng chọn ví.');
            return;
        }

        if (!amount || amount <= 0) {
            toastr.error('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        const data = {
            GoalID: goalId,
            WalletID: walletId,
            Amount: amount,
            Note: note
        };

        $.ajax({
            url: '/Goals/Deposit',  // Sử dụng URL tĩnh
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    toastr.success(response.message);
                    $('#depositModal').modal('hide');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                toastr.error('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });
    });

    // 🟢 Reset form khi đóng modal
    $('#depositModal').on('hidden.bs.modal', function () {
        $('#depositForm')[0].reset();
    });

    // Khởi tạo progress circles nếu có
    initializeProgressCircles();
});

// 🟥 Xóa mục tiêu (function global)
function deleteGoal(goalId) {
    // Kiểm tra xem Swal có tồn tại không
    if (typeof Swal === 'undefined') {
        if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
            performDelete(goalId);
        }
        return;
    }

    Swal.fire({
        title: 'Bạn có chắc không?',
        text: "Hành động này sẽ xóa vĩnh viễn mục tiêu và không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Vâng, xóa nó!',
        cancelButtonText: 'Hủy'
    }).then((result) => {
        if (result.isConfirmed) {
            performDelete(goalId);
        }
    });
}

function performDelete(goalId) {
    $.ajax({
        url: '/Goals/Delete',
        type: 'POST',
        data: {
            id: goalId,
            __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
        },
        beforeSend: function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Đang xử lý...',
                    text: 'Vui lòng chờ trong giây lát.',
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    allowOutsideClick: false
                });
            }
        },
        success: function (response) {
            if (response.success) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Đã xóa!',
                        text: response.message,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    toastr.success(response.message);
                }
                setTimeout(() => location.reload(), 1500);
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Lỗi!',
                        text: response.message,
                        icon: 'error'
                    });
                } else {
                    toastr.error(response.message);
                }
            }
        },
        error: function () {
            const errorMsg = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Lỗi hệ thống!',
                    text: errorMsg,
                    icon: 'error'
                });
            } else {
                toastr.error(errorMsg);
            }
        }
    });
}

// Khởi tạo progress circles
function initializeProgressCircles() {
    // Code để vẽ progress circles nếu cần
    console.log('Progress circles initialized');
}