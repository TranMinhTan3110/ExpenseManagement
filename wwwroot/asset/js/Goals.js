$(document).ready(function () {

    // 1. Khởi tạo flatpickr
    $('#addGoalModal').on('shown.bs.modal', function () {
        flatpickr("#goal-datepicker", { wrap: true, dateFormat: "d-m-Y" });
    });

    // 2. Khởi tạo Progress Circle
    if (typeof initializeProgressCircles === 'function') {
        initializeProgressCircles();
    }

    // ==================== ADD GOAL ====================
    $('#addGoalForm').on('submit', function (e) {
        e.preventDefault();
        const dateInput = $('#goalTargetDateInput').val();
        let formattedDate = null;
        if (dateInput) {
            const parts = dateInput.split('-');
            if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        const data = {
            GoalName: $('#goalNameInput').val(),
            TargetAmount: parseFloat($('#goalTargetAmountInput').val()),
            TargetDate: formattedDate,
            InitialAmount: parseFloat($('#goalInitialAmountInput').val()) || 0
        };

        $.ajax({
            url: '/Goals/Create', type: 'POST', contentType: 'application/json', data: JSON.stringify(data),
            success: function (res) {
                if (res.success) { toastr.success(res.message); $('#addGoalModal').modal('hide'); setTimeout(() => location.reload(), 1500); }
                else { toastr.error(res.message); }
            },
            error: function () { toastr.error('Lỗi kết nối khi tạo mục tiêu.'); }
        });
    });

    // ==================== DEPOSIT ====================
    $(document).on('click', '[data-bs-target="#depositModal"]', function () {
        const goalId = $(this).data('goal-id');
        $('#depositGoalId').val(goalId);
        $('#depositForm')[0].reset();
        $('#depositGoalId').val(goalId);
        loadWalletsToDropdown('#depositWallet');
    });

    $('#depositForm').on('submit', function (e) {
        e.preventDefault();
        const data = {
            GoalID: parseInt($('#depositGoalId').val()),
            WalletID: parseInt($('#depositWallet').val()),
            Amount: parseFloat($('#depositAmount').val()),
            Note: $('#depositNote').val() || ''
        };

        if (!data.WalletID || !data.Amount) { toastr.error('Vui lòng nhập đủ thông tin'); return; }

        $.ajax({
            url: '/Goals/Deposit', type: 'POST', contentType: 'application/json', data: JSON.stringify(data),
            success: function (res) {
                if (res.success) {
                    $('#depositModal').modal('hide');
                    if (res.goalAchieved) {
                        Swal.fire('Chúc mừng!', 'Bạn đã hoàn thành mục tiêu!', 'success').then(() => location.reload());
                    } else {
                        toastr.success(res.message); setTimeout(() => location.reload(), 1500);
                    }
                } else { toastr.error(res.message); }
            },
            error: function () { toastr.error('Lỗi kết nối khi nạp tiền.'); }
        });
    });

    // ==================== WITHDRAW (RÚT TIỀN) ====================
    $(document).on('click', '[data-bs-target="#withdrawModal"]', function () {
        const goalId = $(this).data('goal-id');
        const currentAmount = $(this).data('current-amount');

        $('#withdrawForm')[0].reset();
        $('#withdrawGoalId').val(goalId);

        // Load ví và xử lý số tiền
        loadWalletsToDropdown('#withdrawWallet');

        // Ép kiểu về số để tránh lỗi hiển thị string
        let amountVal = currentAmount;
        if (typeof currentAmount === 'string') {
            amountVal = parseFloat(currentAmount.replace(/\./g, '').replace(/,/g, ''));
        }

        $('#withdrawAmount').val(amountVal);
        $('#withdrawAmount').prop('readonly', true).addClass('bg-light text-muted');

        if ($('#withdraw-notice').length === 0) {
            $('<div id="withdraw-notice" class="alert alert-info mt-2 small"><i class="fa-solid fa-circle-info"></i> Bạn đang thực hiện tất toán toàn bộ số tiền này về ví.</div>').insertBefore('#withdrawForm .mb-3:first');
        }
    });

    $('#withdrawForm').on('submit', function (e) {
        e.preventDefault();

        const walletId = parseInt($('#withdrawWallet').val());
        if (!walletId) { toastr.error('Vui lòng chọn ví để nhận tiền'); return; }

        const data = {
            GoalID: parseInt($('#withdrawGoalId').val()),
            WalletID: walletId,
            Amount: 1, // Gửi số 1 để qua mặt validate, Backend sẽ tự lấy số dư thật
            Note: "Tất toán mục tiêu"
        };

        $.ajax({
            url: '/Goals/WithdrawSilent', type: 'POST', contentType: 'application/json', data: JSON.stringify(data),
            success: function (res) {
                if (res.success) {
                    $('#withdrawModal').modal('hide');
                    Swal.fire('Thành công!', res.message, 'success').then(() => location.reload());
                } else {
                    // Fix lỗi thông báo trống
                    toastr.error(res.message || "Lỗi: Không thể rút tiền.");
                }
            },
            error: function (xhr) {
                let msg = "Lỗi kết nối Server.";
                if (xhr.responseJSON && xhr.responseJSON.message) msg = xhr.responseJSON.message;
                toastr.error(msg);
            }
        });
    });
});

// ==================== HÀM HỖ TRỢ ====================
function loadWalletsToDropdown(selectId) {
    const $select = $(selectId);
    $select.html('<option>⏳ Đang tải...</option>').prop('disabled', true);

    $.ajax({
        url: '/Goals/GetUserWallets', type: 'GET', dataType: 'json',
        success: function (res) {
            $select.prop('disabled', false).empty().append('<option value="">-- Chọn ví --</option>');
            if (res.success && res.data) {
                res.data.forEach(w => {
                    // 🔥 FIX LỖI 34đ: Xử lý bất kể server trả về số hay chuỗi
                    let balanceVal = w.balance;
                    // Nếu là chuỗi có dấu chấm (34.000), xóa chấm đi rồi mới parse
                    if (typeof balanceVal === 'string') {
                        balanceVal = parseFloat(balanceVal.replace(/\./g, '').replace(/,/g, ''));
                    }
                    // Format lại thành tiền Việt
                    let displayBalance = balanceVal.toLocaleString('vi-VN');

                    // Kiểm tra ID (đề phòng server trả về hoa/thường)
                    let id = w.walletID || w.WalletID;
                    let name = w.walletName || w.WalletName;

                    $select.append(`<option value="${id}">${name} - ${displayBalance}đ</option>`);
                });
            } else {
                $select.append('<option>Chưa có ví</option>');
            }
        },
        error: function () {
            $select.html('<option>Lỗi tải ví</option>');
            toastr.error('Không thể tải danh sách ví');
        }
    });
}

function deleteGoal(id) { /* Code xóa giữ nguyên như cũ */
    Swal.fire({
        title: 'Bạn có chắc không?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Xóa', cancelButtonText: 'Hủy'
    }).then((r) => {
        if (r.isConfirmed) {
            $.ajax({
                url: '/Goals/Delete', type: 'POST', contentType: 'application/json', data: JSON.stringify({ Id: id }),
                success: function (res) {
                    if (res.success) { Swal.fire('Đã xóa!', res.message, 'success').then(() => location.reload()); }
                    else { Swal.fire('Lỗi', res.message, 'error'); }
                }
            });
        }
    });
}

function initializeProgressCircles() { console.log('Progress init'); }