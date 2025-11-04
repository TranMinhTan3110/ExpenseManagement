// wallet
var walletList = document.querySelectorAll(".wallet-list__item");

walletList.forEach(wallet => {
    wallet.addEventListener('click', (e) => {
        e.preventDefault();
        var currentWallet = document.querySelector(".wallet-list__item--active")
        if (currentWallet) {
            currentWallet.classList.remove('wallet-list__item--active')
        }
        e.currentTarget.classList.add('wallet-list__item--active')
    })
})



// Khai báo biến myChart ở ngoài (phạm vi global) để file site.js có thể "thấy"
var myChart = null;

// Hàm lấy màu (bạn đã có trong theme-utils.js, nhưng nếu chưa thì thêm vào)
function getLegendColor() {
    return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color').trim();
}

document.addEventListener('DOMContentLoaded', function () {
    const pie = document.getElementById('categoryPieChart');

    // Chỉ chạy code nếu tìm thấy canvas
    if (pie) {
        const categoryLabels = ['Ăn sáng', 'Mua sắm', 'Thời Trang', 'Đi lại'];
        const categoryData = [500000, 200000, 300000, 150000];

        // Gán biểu đồ cho biến global
        myChart = new Chart(pie, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    label: 'Chi tiêu',
                    data: categoryData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        align: 'center',
                        labels: {
                            // DÙNG HÀM (CÔNG THỨC) THAY VÌ MÀU CỐ ĐỊNH
                            color: function (context) {
                                // Lấy màu --text-color hiện tại MỖI KHI VẼ LẠI
                                return getLegendColor();
                            },
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 10,
                            boxWidth: 20,
                            usePointStyle: false
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    }
                }
            }
        });
    } // kết thúc if(pie)
});

//Chỉ chạy code khi trang HTML đã tải xong
//document.addEventListener('DOMContentLoaded', function () {

//    // --- 1. LẤY CÁC ELEMENT CHÍNH ---
//    const walletListContainer = document.querySelector(".wallet-list");
//    const addWalletForm = document.getElementById('addWalletForm');
//    const transactionHistoryBody = document.querySelector(".transaction-history tbody");

//    // Nếu không tìm thấy list ví, thì không chạy code
//    if (!walletListContainer) {
//        return;
//    }

//    // --- 2. CODE WALLET CLICK (SỰ KIỆN) ---
//    walletListContainer.addEventListener('click', function (e) {
//        const clickedWallet = e.target.closest('.wallet-list__item');
//        if (!clickedWallet) return;
//        e.preventDefault();
//        var currentWallet = document.querySelector(".wallet-list__item--active")
//        if (currentWallet) {
//            currentWallet.classList.remove('wallet-list__item--active')
//        }
//        clickedWallet.classList.add('wallet-list__item--active');
//        const walletId = clickedWallet.dataset.walletId;
//        loadWalletDetails(walletId);
//    });

//    // --- 3. CODE AJAX (TẢI DỮ LIỆU) ---

//    // Hàm tải danh sách ví (bên trái)
//    async function loadWalletList() {
//        try {
//            const response = await fetch('/api/wallet');
//            if (!response.ok) throw new Error('Không tải được danh sách ví');
//            const wallets = await response.json();

//            walletListContainer.innerHTML = ''; // Xóa list cũ

//            if (wallets.length === 0) {
//                // Nếu rỗng, hiển thị mặc định
//                loadWalletDetails(null); // Gọi hàm tải chi tiết với ID rỗng
//                return;
//            }

//            // Lặp và "vẽ" ra list ví mới
//            wallets.forEach(wallet => {
//                const li = document.createElement('li');
//                li.className = 'wallet-list__item mb-3';
//                li.dataset.walletId = wallet.walletID;

//                li.innerHTML = `
//                    <a href="">
//                        <div class="wallet-list__icon"><i class="${wallet.icon}"></i></div>
//                        <div class="wallet-list__info">
//                            <h5 class="wallet-list__name">${wallet.walletName}</h5>
//                            <p class="wallet-list__balance">${wallet.balance.toLocaleString()}đ</p>
//                        </div>
//                    </a>
//                `;
//                walletListContainer.appendChild(li);
//            });

//            // Tự động click vào ví đầu tiên (nếu có)
//            const firstWallet = walletListContainer.querySelector('.wallet-list__item');
//            if (firstWallet) {
//                firstWallet.classList.add('wallet-list__item--active');
//                loadWalletDetails(firstWallet.dataset.walletId);
//            }
//        } catch (error) {
//            console.error("Lỗi tải danh sách ví:", error);
//        }
//    }

//    // Hàm tải chi tiết (bên phải)
//    async function loadWalletDetails(walletId) {
//        // Nếu không có ví nào (lần đầu vào)
//        if (!walletId) {
//            document.querySelector('.wallet-title h4').textContent = "Chưa có ví";
//            document.querySelector('.total-balance .balance-amount').textContent = "0đ";
//            document.querySelector('.monthly-expense .balance-amount').textContent = "0đ";
//            renderPieChart([]); // Vẽ biểu đồ rỗng
//            renderTransactionHistory([]); // Vẽ bảng rỗng
//            return;
//        }

//        // Nếu có ví, gọi API
//        try {
//            const response = await fetch(`/api/wallet/${walletId}/details`);
//            if (!response.ok) throw new Error('Không tải được chi tiết ví');
//            const details = await response.json();

//            // Đổ dữ liệu vào HTML (bên phải)
//            document.querySelector('.wallet-title h4').textContent = details.walletName;
//            document.querySelector('.total-balance .balance-amount').textContent = `${details.totalBalance.toLocaleString()}đ`;
//            document.querySelector('.monthly-expense .balance-amount').textContent = `${details.monthlyExpenses.toLocaleString()}đ`;

//            // GỌI HÀM VẼ BIỂU ĐỒ (từ file Wallet.js)
//            renderPieChart(details.expenseBreakdown);

//            // GỌI HÀM VẼ BẢNG
//            renderTransactionHistory(details.transactionHistory);
//        } catch (error) {
//            console.error("Lỗi tải chi tiết ví:", error);
//        }
//    }

//    // HÀM VẼ BẢNG LỊCH SỬ GIAO DỊCH
//    function renderTransactionHistory(history) {
//        if (!transactionHistoryBody) return;
//        transactionHistoryBody.innerHTML = '';
//        if (history.length === 0) {
//            transactionHistoryBody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có giao dịch nào.</td></tr>';
//            return;
//        }
//        history.forEach(tx => {
//            const row = document.createElement('tr');
//            const amountClass = tx.type === 'Income' ? 'text-success' : 'text-danger';
//            const amountSign = tx.type === 'Income' ? '+' : '-';
//            const txDate = new Date(tx.transactionDate).toLocaleDateString('vi-VN');

//            row.innerHTML = `
//                <td>
//                    <span class="transaction-icon" style="background-color: ${tx.category.color.hexCode}1A; color: ${tx.category.color.hexCode};">
//                        <i class="${tx.category.icon.iconClass}"></i>
//                    </span>
//                    <span class="category-name">${tx.category.categoryName}</span>
//                </td>
//                <td class="transaction-date">${txDate}</td>
//                <td class="transaction-description">${tx.description}</td>
//                <td class="transaction-amount ${amountClass} text-end">${amountSign}${tx.amount.toLocaleString()}đ</td>
//            `;
//            transactionHistoryBody.appendChild(row);
//        });
//    }

//    // 4. CHẠY HÀM TẢI DỮ LIỆU KHI MỞ TRANG
//    loadWalletList();

//    // --- 5. CODE FORM "THÊM VÍ MỚI" ---
//    if (addWalletForm) {
//        addWalletForm.addEventListener('submit', async function (e) {
//            e.preventDefault();
//            const formData = new FormData(addWalletForm);
//            const data = {
//                WalletName: formData.get("WalletName"),
//                InitialBalance: formData.get("InitialBalance"),
//                WalletType: formData.get("WalletType")
//            };

//            if (!data.WalletName || !data.WalletType || data.InitialBalance === null) {
//                Swal.fire("Thiếu thông tin", "Vui lòng điền đầy đủ 3 ô.", "warning");
//                return;
//            }

//            try {
//                const res = await fetch('/api/wallet', {
//                    method: 'POST',
//                    headers: { 'Content-Type': 'application/json' },
//                    body: JSON.stringify(data)
//                });

//                if (res.ok) {
//                    Swal.fire({ icon: "success", title: "Tạo thành công!", showConfirmButton: false, timer: 1500 });

//                    var modalEl = document.getElementById('addWalletModal');
//                    if (typeof bootstrap !== 'undefined') {
//                        var modalInstance = bootstrap.Modal.getInstance(modalEl);
//                        if (modalInstance) modalInstance.hide();
//                    }
//                    loadWalletList(); // Tải lại list ví

//                } else {
//                    const errorData = await res.json();
//                    Swal.fire("Lỗi!", errorData.message || "Vui lòng kiểm tra lại.", "error");
//                }
//            } catch (error) {
//                console.error("Lỗi khi tạo ví:", error);
//                Swal.fire("Lỗi kết nối!", "Không thể kết nối đến server.", "error");
//            }
//        });
//    }

//}); // kết thúc DOMContentLoaded

