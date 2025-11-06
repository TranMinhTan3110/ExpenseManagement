let incomeChart = null;

document.addEventListener('DOMContentLoaded', async function () {
    const walletFilter = document.getElementById('walletFilter');
    const monthFilter = document.getElementById('monthFilter');
    const btnApplyFilter = document.getElementById('btnApplyFilter');
    const btnResetFilter = document.getElementById('btnResetFilter');

    // --- SET THÁNG HIỆN TẠI ---
    const now = new Date();
    monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // --- LOAD DANH SÁCH VÍ ---
    await loadWalletList();

    // --- LOAD DỮ LIỆU INCOME BAN ĐẦU ---
    await loadIncomeAnalytics();

    // BUTTON FILTER
    btnApplyFilter.addEventListener('click', loadIncomeAnalytics);

    // BUTTON RESET
    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', function () {
            walletFilter.value = '';
            const now = new Date();
            monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            loadIncomeAnalytics();
        });
    }

    // --- LOAD WALLET LIST (giống Expense.js) ---
    async function loadWalletList() {
        try {
            const response = await fetch('/api/wallet');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const wallets = await response.json();
            walletFilter.innerHTML = '<option value="">Tất cả ví</option>';

            wallets.forEach(wallet => {
                const name = wallet.walletName || wallet.WalletName || "Ví";
                const balance = wallet.balance || wallet.Balance || 0;
                const id = wallet.walletID || wallet.WalletID;

                walletFilter.innerHTML += `<option value="${id}">
                        ${name} (${balance.toLocaleString()}đ)
                    </option>`;
            });

        } catch (err) {
            walletFilter.innerHTML = '<option value="">Lỗi tải ví</option>';
            console.error(err);
        }
    }

    // --- LOAD INCOME ANALYTICS ---
    async function loadIncomeAnalytics() {
        try {
            showLoadingState();

            const walletId = walletFilter.value;
            const month = monthFilter.value;

            let url = `/api/analytics/income?month=${month}`;
            if (walletId) url += `&walletId=${walletId}`;

            console.log("📡 Calling API:", url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            console.log("✅ Data received:", data);

            const breakdown = data.incomeBreakdown || data.IncomeBreakdown || [];
            const history = data.transactionHistory || data.TransactionHistory || [];
            const totalIncome = data.totalIncome || data.TotalIncome || 0;

            renderIncomePieChart(breakdown);
            renderBreakdownList(breakdown);
            renderTransactionTable(history);
            updateTotalIncome(totalIncome);

        } catch (error) {
            showErrorState(error.message);
            console.error(error);
        }
    }

    // --- SHOW LOADING ---
    function showLoadingState() {
        const listContainer = document.querySelector('.list-1 ul');
        if (listContainer)
            listContainer.innerHTML = '<li class="text-center text-muted"><i class="fi fi-rr-spinner"></i> Đang tải...</li>';

        const tbody = document.querySelector('.transaction-table tbody');
        if (tbody)
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">
                    <i class="fi fi-rr-spinner"></i> Đang tải dữ liệu...
                </td></tr>`;

        // Clear old chart
        const canvas = document.getElementById('chartjsIncome');
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }

    // --- SHOW ERROR ---
    function showErrorState(msg) {
        const tbody = document.querySelector('.transaction-table tbody');
        tbody.innerHTML = `<tr>
                <td colspan="4" class="text-center text-danger">
                    <i class="fi fi-rr-cross-circle" style="font-size: 40px;"></i>
                    <p class="mt-2">Lỗi tải dữ liệu</p>
                    <small>${msg}</small>
                </td>
            </tr>`;
    }

    // --- UPDATE TOTAL ---
    function updateTotalIncome(total) {
        const el = document.getElementById('totalIncome');
        if (el) el.textContent = `Tổng: ${Number(total).toLocaleString()}đ`;
    }

    // --- PIE CHART ---
    function renderIncomePieChart(breakdown) {
        const canvas = document.getElementById('chartjsIncome');
        if (!canvas) return;

        if (incomeChart) {
            incomeChart.destroy();
            incomeChart = null;
        }

        // Nếu không có dữ liệu → ẩn chart + hiện thông báo đẹp
        if (!breakdown || breakdown.length === 0) {

            // Ẩn canvas chart
            canvas.style.display = "none";

            // Tạo UI No Data nếu chưa có
            let noDataEl = document.querySelector(".chart-no-data");
            if (!noDataEl) {
                noDataEl = document.createElement("div");
                noDataEl.className = "chart-no-data";
                noDataEl.innerHTML = `
            <i class="fi fi-rr-chart-pie-alt" style="font-size: 42px; opacity: .4;"></i>
            <p class="mt-2 mb-0">Không có dữ liệu để hiển thị</p>
        `;
                canvas.parentNode.appendChild(noDataEl);
            }

            return;
        } else {
            // Có dữ liệu → hiện canvas, ẩn No Data
            canvas.style.display = "block";
            const noDataEl = document.querySelector(".chart-no-data");
            if (noDataEl) noDataEl.remove();
        }

        const labels = breakdown.map(x => x.categoryName || x.CategoryName);
        const values = breakdown.map(x => Number(x.amount || x.Amount));
        const colors = breakdown.map(x => x.colorHex || x.ColorHex || "#6ab04c");

        incomeChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: "#fff"
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }

    // --- RENDER BREAKDOWN LIST ---
    function renderBreakdownList(breakdown) {
        const listContainer = document.querySelector('.list-1 ul');
        if (!listContainer) return;

        if (!breakdown || breakdown.length === 0) {
            listContainer.innerHTML = `
                <li class="no-data-display">
                    <i class="fi fi-rr-document" style="font-size: 38px; opacity: .4;"></i>
                    <p class="mt-2 mb-0 text-muted">Không có dữ liệu để hiển thị</p>
                </li>`;
            return;
        }

        listContainer.innerHTML = "";

        breakdown.forEach(item => {
            const name = item.categoryName || item.CategoryName;
            const amount = Number(item.amount || item.Amount);
            const percentage = Number(item.percentage || item.Percentage);
            const colorHex = item.colorHex || item.ColorHex || "#6ab04c";

            const li = document.createElement("li");
            li.innerHTML = `
                <p class="mb-0">
                    <span style="display:inline-block;width:12px;height:12px;background:${colorHex};border-radius:2px;margin-right:8px;"></span>
                    ${name}
                </p>
                <h5 class="mb-0">
                    <span>${amount.toLocaleString()}đ</span> ${percentage}%
                </h5>`;
            listContainer.appendChild(li);
        });
    }

    // --- RENDER TRANSACTION TABLE ---
    function renderTransactionTable(history) {
        const tbody = document.querySelector('.transaction-table tbody');
        if (!tbody) return;

        if (!history || history.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">
                    <i class="fi fi-rr-document" style="font-size: 48px; opacity: 0.3;"></i>
                    <p class="mt-2 mb-0">Chưa có giao dịch thu nhập</p>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = "";

        history.forEach((tx, i) => {
            const date = new Date(tx.transactionDate || tx.TransactionDate)
                .toLocaleDateString("vi-VN");

            const category = tx.category || tx.Category || {};
            const name = category.categoryName || category.CategoryName || "Khác";
            const icon = category.icon?.iconClass || category.Icon?.IconClass || "fi fi-rr-circle";
            const color = category.color?.hexCode || category.Color?.HexCode || "#4caf50";

            const amount = Number(tx.amount || tx.Amount);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="table-category-icon">
                        <i class="${icon}" style="color:${color}"></i> ${name}
                    </span></td>
                <td>${date}</td>
                <td>${tx.description || tx.Description || "-"}</td>
                <td class="text-success text-end fw-bold">+${amount.toLocaleString()}đ</td>`;

            tbody.appendChild(tr);
        });
    }

});
