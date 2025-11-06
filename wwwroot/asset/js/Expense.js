document.addEventListener('DOMContentLoaded', async function () {
    const walletFilter = document.getElementById('walletFilter');
    const monthFilter = document.getElementById('monthFilter');
    const btnApplyFilter = document.getElementById('btnApplyFilter');

    // Set tháng hiện tại làm mặc định
    const now = new Date();
    monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Load danh sách ví
    await loadWalletList();

    // Load dữ liệu ban đầu
    await loadAnalytics();

    // Sự kiện click nút "Lọc"
    btnApplyFilter.addEventListener('click', loadAnalytics);

    // --- HÀM LOAD DANH SÁCH VÍ ---
    async function loadWalletList() {
        try {
            const response = await fetch('/api/wallet');
            const wallets = await response.json();

            walletFilter.innerHTML = '<option value="">Tất cả ví</option>';
            wallets.forEach(wallet => {
                walletFilter.innerHTML += `<option value="${wallet.walletID}">${wallet.walletName}</option>`;
            });
        } catch (error) {
            console.error('Lỗi load ví:', error);
        }
    }

    // --- HÀM LOAD DỮ LIỆU ANALYTICS (ĐÃ SỬA) ---
    async function loadAnalytics() {
        try {
            const walletId = walletFilter.value;
            const month = monthFilter.value;

            // ✅ FIX: Chỉ thêm walletId vào URL nếu nó có giá trị
            let url = `/api/analytics/expense?month=${month}`;
            if (walletId) {
                url += `&walletId=${walletId}`;
            }

            console.log('Calling API:', url); // Debug

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            console.log('Data received:', data); // Debug

            // Vẽ Pie Chart
            renderExpensePieChart(data.expenseBreakdown || []);

            // Vẽ danh sách breakdown
            renderBreakdownList(data.expenseBreakdown || []);

            // Vẽ bảng lịch sử
            renderTransactionTable(data.transactionHistory || []);

        } catch (error) {
            console.error('Lỗi load analytics:', error);
            alert('Không thể tải dữ liệu. Vui lòng kiểm tra console.');
        }
    }

    // --- VẼ PIE CHART (ĐÃ SỬA) ---
    let expenseChart = null;
    function renderExpensePieChart(breakdown) {
        const canvas = document.getElementById('chartjsExpense');
        if (!canvas) return;

        // Xóa chart cũ
        if (expenseChart) {
            expenseChart.destroy();
        }

        // Nếu không có dữ liệu
        if (breakdown.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('Chưa có dữ liệu', canvas.width / 2, canvas.height / 2);
            return;
        }

        const labels = breakdown.map(x => x.categoryName);
        const data = breakdown.map(x => x.amount);
        const colors = breakdown.map(x => x.colorHex);

        expenseChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false // Ẩn legend vì có danh sách bên dưới
                    }
                }
            }
        });
    }

    // --- VẼ DANH SÁCH BREAKDOWN (ĐÃ SỬA) ---
    function renderBreakdownList(breakdown) {
        const listContainer = document.querySelector('.list-1 ul');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        if (breakdown.length === 0) {
            listContainer.innerHTML = '<li class="text-muted">Chưa có dữ liệu</li>';
            return;
        }

        breakdown.forEach(item => {
            listContainer.innerHTML += `
                <li>
                    <p class="mb-0">
                        <span style="display:inline-block; width:12px; height:12px; background:${item.colorHex}; border-radius:2px; margin-right:8px;"></span>
                        ${item.categoryName}
                    </p>
                    <h5 class="mb-0">
                        <span>${item.amount.toLocaleString()}đ</span>
                        ${item.percentage}%
                    </h5>
                </li>
            `;
        });
    }

    // --- VẼ BẢNG LỊCH SỬ (ĐÃ SỬA) ---
    function renderTransactionTable(history) {
        const tbody = document.querySelector('.transaction-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có giao dịch nào</td></tr>';
            return;
        }

        history.forEach(tx => {
            const date = new Date(tx.transactionDate);
            const formattedDate = date.toLocaleDateString('vi-VN');

            // Lấy thông tin category (có thể null)
            const categoryName = tx.category?.categoryName || 'Khác';
            const iconClass = tx.category?.icon?.iconClass || 'fi fi-rr-circle-question';
            const colorHex = tx.category?.color?.hexCode || '#999';

            tbody.innerHTML += `
                <tr>
                    <td>
                        <span class="table-category-icon">
                            <i class="${iconClass}" style="color: ${colorHex}"></i>
                            ${categoryName}
                        </span>
                    </td>
                    <td>${formattedDate}</td>
                    <td>${tx.description || '-'}</td>
                    <td class="text-danger">-${tx.amount.toLocaleString()}đ</td>
                </tr>
            `;
        });
    }
});