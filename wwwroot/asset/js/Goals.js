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
            url: '/Goals/Create',
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

    // ========== DEPOSIT MODAL ==========

    // 🟢 Khi click nút "Nạp tiền", lưu GoalID vào modal
    $(document).on('click', '[data-bs-target="#depositModal"]', function () {
        const goalId = $(this).data('goal-id');
        $('#depositGoalId').val(goalId);
        $('#depositForm')[0].reset();
        $('#depositGoalId').val(goalId); // Set lại sau khi reset
    });
    //  Khi click nút "Rút tiền"
    $(document).on('click', '[data-bs-target="#withdrawModal"]', function () {
        const goalId = $(this).data('goal-id');

        // SỬA: Không phải 'walletDataString' nữa, đây là 'wallets' object/array
        const wallets = $(this).data('wallets');

        const $modal = $('#withdrawModal');
        const $select = $modal.find('#withdrawWallet');

        // 1. Reset form
        $modal.find('form')[0].reset();
        $modal.find('#withdrawGoalId').val(goalId);

        // 2. Xóa dropdown cũ, thêm option mặc định
        $select.empty().append('<option value="">-- Chọn ví để rút về --</option>');
        $select.prop('disabled', true);

        // 3. Đọc JSON và điền vào dropdown
        // SỬA: Không cần 'try...catch' hay 'JSON.parse' nữa
        if (wallets && wallets.length > 0) {
            wallets.forEach(function (wallet) {
                const id = wallet.walletID;
                const name = wallet.walletName;
                const amount = (wallet.amount).toLocaleString('vi-VN');

                $select.append(
                    `<option value="${id}">${name} (Hiện có: ${amount} VNĐ)</option>`
                );
            });
            $select.prop('disabled', false); // Mở khóa dropdown
        } else {
            $select.append('<option value="">Mục tiêu này chưa có tiền</option>');
        }
    });

    // 🟢 Khi modal mở, load danh sách ví
    const depositModalEl = document.getElementById('depositModal');
    if (depositModalEl) {
        console.log('✅ Tìm thấy modal element');

        depositModalEl.addEventListener('show.bs.modal', function (event) {
            console.log('🎯 Modal đang mở - Load ví');
            loadWalletsToDropdown('#depositWallet');
        });
    } else {
        console.error('❌ KHÔNG tìm thấy modal element!');
    }


    // 🟢 Submit form nạp tiền
    $('#depositForm').on('submit', function (e) {
        e.preventDefault();
        console.log('📤 Form submitted');

        const goalId = parseInt($('#depositGoalId').val());
        const walletId = parseInt($('#depositWallet').val());
        const amount = parseFloat($('#depositAmount').val());
        const note = $('#depositNote').val() || '';

        // Validate
        if (!walletId) {
            toastr.error('Vui lòng chọn ví');
            return;
        }

        // ✅ CHO PHÉP NẠP BẤT KỲ SỐ TIỀN NÀO > 0
        if (!amount || amount <= 0) {
            toastr.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        console.log('✅ Validation passed', { goalId, walletId, amount });

        const data = {
            GoalID: goalId,
            WalletID: walletId,
            Amount: amount,
            Note: note
        };

        // Gọi API nạp tiền
        $.ajax({
            url: '/Goals/Deposit',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    $('#depositModal').modal('hide');

                    // ✅ Kiểm tra xem đã đạt mục tiêu chưa
                    if (response.goalAchieved || (response.data && response.data.goalAchieved)) {
                        // 🎉 Đã đạt mục tiêu - hiển thị thông báo đặc biệt
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                title: '🎉 Chúc mừng!',
                                html: `<p>${response.message}</p><p><strong>Bạn đã hoàn thành mục tiêu này!</strong></p>`,
                                icon: 'success',
                                confirmButtonColor: '#28a745',
                                confirmButtonText: 'Tuyệt vời!',
                                timer: 3000
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            toastr.success(response.message + ' - Đã hoàn thành mục tiêu!');
                            setTimeout(() => location.reload(), 2000);
                        }
                    } else {
                        // Chưa đạt mục tiêu - thông báo bình thường
                        toastr.success(response.message);
                        setTimeout(() => location.reload(), 1500);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('❌ Error:', xhr.status, xhr.responseText);
                toastr.error('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });
    });

    // 🟢 Reset form khi đóng modal
    $('#depositModal').on('hidden.bs.modal', function () {
        $('#depositForm')[0].reset();
    });


    // 🟢 Submit form rút tiền
    $('#withdrawForm').on('submit', function (e) {
        e.preventDefault();
        console.log('📤 Form submitted');

        const goalId = parseInt($('#withdrawGoalId').val());
        const walletId = parseInt($('#withdrawWallet').val());
        const amount = parseFloat($('#withdrawAmount').val());
        const note = $('#withdrawNote').val() || '';

        // Validate
        if (!walletId) {
            toastr.error('Vui lòng chọn ví');
            return;
        }

        // ✅ CHO PHÉP NẠP BẤT KỲ SỐ TIỀN NÀO > 0
        if (!amount || amount <= 0) {
            toastr.error('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        console.log('✅ Validation passed', { goalId, walletId, amount });

        const data = {
            GoalID: goalId,
            WalletID: walletId,
            Amount: amount,
            Note: note
        };

        // Gọi API nạp tiền
        $.ajax({
            url: '/Goals/Withdraw',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    $('#withdrawModal').modal('hide');

                    // ✅ Kiểm tra xem đã đạt mục tiêu chưa
                    if (response.goalAchieved || (response.data && response.data.goalAchieved)) {
                        // 🎉 Đã đạt mục tiêu - hiển thị thông báo đặc biệt
                        if (typeof Swal !== 'undefined') {
                            Swal.fire({
                                title: '🎉 Chúc mừng!',
                                html: `<p>${response.message}</p><p><strong>Bạn đã hoàn thành mục tiêu này!</strong></p>`,
                                icon: 'success',
                                confirmButtonColor: '#28a745',
                                confirmButtonText: 'Tuyệt vời!',
                                timer: 3000
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            toastr.success(response.message + ' - Đã hoàn thành mục tiêu!');
                            setTimeout(() => location.reload(), 2000);
                        }
                    } else {
                        // Chưa đạt mục tiêu - thông báo bình thường
                        toastr.success(response.message);
                        setTimeout(() => location.reload(), 1500);
                    }
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('❌ Error:', xhr.status, xhr.responseText);
                toastr.error('Có lỗi xảy ra, vui lòng thử lại.');
            }
        });
    });

    // 🟢 Reset form khi đóng modal
    $('#withdrawModal').on('hidden.bs.modal', function () {
        $('#withdrawForm')[0].reset();
    });


    // Khởi tạo progress circles nếu có
    initializeProgressCircles();
});

// ========== HÀM LOAD VÍ ==========
function loadWalletsToDropdown(selectId) {
    console.log('🔄 Loading wallets...');

    const $select = $(selectId);

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

// 🟥 Xóa mục tiêu
function deleteGoal(goalId) {
    if (typeof Swal === 'undefined') {
        if (confirm('Bạn có chắc muốn xóa mục tiêu này?')) {
            performDelete(goalId);
        }
        return;
    }

    Swal.fire({
        title: 'Bạn có chắc không?',
        html: `
            <p>Hành động này sẽ xóa vĩnh viễn mục tiêu và không thể hoàn tác!</p>
            <p style="color: #28a745; font-weight: bold;">✅ Nếu mục tiêu đã có tiền, số tiền sẽ được hoàn lại vào ví.</p>
        `,
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
        contentType: 'application/json',
        data: JSON.stringify({ Id: goalId }),
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
                        text: response.message || 'Mục tiêu đã được xóa thành công.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    toastr.success(response.message);
                }
                setTimeout(() => location.reload(), 2000);
            } else {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Lỗi!',
                        text: response.message || 'Không thể xóa mục tiêu.',
                        icon: 'error'
                    });
                } else {
                    toastr.error(response.message);
                }
            }
        },
        error: function (xhr) {
            console.error('❌ Delete error:', xhr.status, xhr.responseText);

            let errorMsg = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';

            // Xử lý lỗi chi tiết từ server
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMsg = xhr.responseJSON.message;
            } else if (xhr.responseText) {
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // Không parse được JSON, giữ message mặc định
                }
            }

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
    console.log('Progress circles initialized');
}