let incomeChart = null;
let currentPage = 1;
let totalPages = 1;
let totalRecords = 0;

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
    await loadIncomeAnalytics(1);

    // BUTTON FILTER
    btnApplyFilter.addEventListener('click', () => loadIncomeAnalytics(1));

    // BUTTON RESET
    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', function () {
            walletFilter.value = '';
            const now = new Date();
            monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            loadIncomeAnalytics(1);
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
    async function loadIncomeAnalytics(page = 1) {
        try {
            currentPage = page; // LƯU TRẠNG THÁI TRANG HIỆN TẠI
            showLoadingState();

            const walletId = walletFilter.value;
            const month = monthFilter.value;

            // THAY ĐỔI: Thêm page và pageSize vào URL
            let url = `/api/analytics/income?month=${month}&page=${page}&pageSize=7`;
            if (walletId) url += `&walletId=${walletId}`;

            console.log("📡 Calling API:", url);

            const response = await fetch(url);
            // ... xử lý lỗi ...

            const data = await response.json();
            console.log("✅ Data received:", data);

            const breakdown = data.incomeBreakdown || data.IncomeBreakdown || [];
            const history = data.transactionHistory || data.TransactionHistory || [];
            const totalIncome = data.totalIncome || data.TotalIncome || 0;

            // THÊM: Lấy thông tin phân trang từ response
            currentPage = data.currentPage || data.CurrentPage || 1;
            totalPages = data.totalPages || data.TotalPages || 1;
            totalRecords = data.totalRecords || data.TotalRecords || 0;

            renderIncomePieChart(breakdown);
            renderBreakdownList(breakdown);
            renderTransactionTable(history);
            updateTotalIncome(totalIncome);

            renderPagination(); // THÊM: Render thanh phân trang

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
    function renderPagination() {
        const paginationWrapper = document.getElementById('paginationWrapper');
        const paginationInfo = document.getElementById('paginationInfo');
        const paginationControls = document.getElementById('paginationControls');

        if (!paginationWrapper || !paginationInfo || !paginationControls) {
            console.warn('⚠️ Không tìm thấy pagination elements');
            return;
        }

        // Nếu không có dữ liệu hoặc chỉ có 1 trang → ẩn pagination
        if (totalRecords === 0 || totalPages <= 1) {
            paginationWrapper.style.display = 'none';
            return;
        }

        // Hiển thị pagination
        paginationWrapper.style.display = 'flex';

        // Tính toán số records hiển thị
        const pageSize = 7; // Phải khớp với pageSize mặc định trong service
        const startRecord = (currentPage - 1) * pageSize + 1;
        const endRecord = Math.min(currentPage * pageSize, totalRecords);

        // Cập nhật pagination info
        paginationInfo.textContent = `Hiển thị ${startRecord}-${endRecord} / ${totalRecords}`;

        // Clear pagination controls
        paginationControls.innerHTML = '';

        // ===== TẠO PAGINATION BUTTONS =====

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" data-page="${currentPage - 1}">‹</a>`;
        paginationControls.appendChild(prevLi);

        // Tính toán các page numbers cần hiển thị
        const pageNumbers = calculatePageNumbers(currentPage, totalPages);

        pageNumbers.forEach(page => {
            const li = document.createElement('li');

            if (page === '...') {
                li.className = 'page-item dots';
                li.innerHTML = '<span class="page-link">...</span>';
            } else {
                li.className = `page-item ${page === currentPage ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" data-page="${page}">${page}</a>`;
            }

            paginationControls.appendChild(li);
        });

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" data-page="${currentPage + 1}">›</a>`;
        paginationControls.appendChild(nextLi);

        // ===== GẮN SỰ KIỆN CLICK =====
        paginationControls.querySelectorAll('.page-link[data-page]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const page = parseInt(this.dataset.page);
                if (page >= 1 && page <= totalPages && page !== currentPage) {
                    loadIncomeAnalytics(page); // QUAN TRỌNG: Gọi hàm load của Income

                    // Scroll to top của transaction table
                    document.querySelector('.transaction-table').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        console.log(`✅ Pagination rendered: Page ${currentPage}/${totalPages}`);
    }

    // ===== HÀM TÍNH TOÁN PAGE NUMBERS (COPY TỪ EXPENSE.JS VÀO ĐÂY) =====
    function calculatePageNumbers(current, total) {
        const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
        const range = [];

        for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
            range.push(i);
        }

        if (current - delta > 2) {
            range.unshift('...');
        }
        if (current + delta < total - 1) {
            range.push('...');
        }

        range.unshift(1);
        if (total > 1) {
            range.push(total);
        }

        return range;
    }
});
