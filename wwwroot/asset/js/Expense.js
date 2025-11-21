let expenseChart = null;
let currentPage = 1;
let totalPages = 1;
let totalRecords = 0;

document.addEventListener('DOMContentLoaded', async function () {
    const walletFilter = document.getElementById('walletFilter');
    const monthFilter = document.getElementById('monthFilter');
    const btnApplyFilter = document.getElementById('btnApplyFilter');
    const btnResetFilter = document.getElementById('btnResetFilter');

    // Set tháng hiện tại làm mặc định
    const now = new Date();
    monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Load danh sách ví
    await loadWalletList();

    // Load dữ liệu ban đầu
    await loadAnalytics(1);

    // Sự kiện click nút "Lọc"
    btnApplyFilter.addEventListener('click', () => loadAnalytics(1));

    // Sự kiện click nút "Reset"
    if (btnResetFilter) {
        btnResetFilter.addEventListener('click', function () {
            walletFilter.value = '';
            const now = new Date();
            monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            loadAnalytics(1);
        });
    }

    // --- HÀM LOAD DANH SÁCH VÍ ---
    async function loadWalletList() {
        try {
            const response = await fetch('/api/wallet');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const wallets = await response.json();

            walletFilter.innerHTML = '<option value="">Tất cả ví</option>';
            if (wallets && wallets.length > 0) {
                wallets.forEach(wallet => {
                    const balance = wallet.balance || wallet.Balance || 0;
                    const name = wallet.walletName || wallet.WalletName || 'Ví';
                    const id = wallet.walletID || wallet.WalletID;
                    walletFilter.innerHTML += `<option value="${id}">${name} (${balance.toLocaleString()}đ)</option>`;
                });
            }
        } catch (error) {
            console.error('❌ Lỗi load ví:', error);
            walletFilter.innerHTML = '<option value="">Lỗi tải danh sách ví</option>';
        }
    }

    // --- HÀM LOAD DỮ LIỆU ANALYTICS (CÓ PHÂN TRANG) ---
    async function loadAnalytics(page = 1) {
        try {
            currentPage = page;
            showLoadingState();

            const walletId = walletFilter.value;
            const month = monthFilter.value;

            // Build URL với page parameter
            let url = `/api/analytics/expense?month=${month}&page=${page}&pageSize=7`;
            if (walletId && walletId !== '') {
                url += `&walletId=${walletId}`;
            }

            console.log('📡 Calling API:', url);

            const response = await fetch(url);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = await response.text() || errorMessage;
                }
                console.error('❌ API Error:', response.status, errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Data received:', data);

            // Xử lý property names (lowercase và uppercase)
            const expenseBreakdown = data.expenseBreakdown || data.ExpenseBreakdown || [];
            const transactionHistory = data.transactionHistory || data.TransactionHistory || [];
            const totalExpense = data.totalExpense || data.TotalExpense || 0;

            // ✅ Lấy thông tin phân trang
            currentPage = data.currentPage || data.CurrentPage || 1;
            totalPages = data.totalPages || data.TotalPages || 1;
            totalRecords = data.totalRecords || data.TotalRecords || 0;

            // Vẽ Pie Chart (chỉ lần đầu hoặc khi filter thay đổi)
            renderExpensePieChart(expenseBreakdown);

            // Vẽ danh sách breakdown
            renderBreakdownList(expenseBreakdown);

            // Vẽ bảng lịch sử
            renderTransactionTable(transactionHistory);

            // Cập nhật tổng chi tiêu
            updateTotalExpense(totalExpense);

            // ✅ Render pagination
            renderPagination();

            console.log('✅ Render completed successfully');

        } catch (error) {
            console.error('❌ Lỗi load analytics:', error);
            showErrorState(error.message);
        }
    }

    // --- HIỂN THỊ LOADING STATE ---
    function showLoadingState() {
        const listContainer = document.querySelector('.list-1 ul');
        if (listContainer) {
            listContainer.innerHTML = '<li class="text-center text-muted" style="padding: 20px;"><i class="fi fi-rr-spinner"></i> Đang tải...</li>';
        }

        const tbody = document.querySelector('.transaction-table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 40px;"><i class="fi fi-rr-spinner"></i> Đang tải dữ liệu...</td></tr>';
        }

        // Hide pagination khi loading
        const paginationWrapper = document.getElementById('paginationWrapper');
        if (paginationWrapper) {
            paginationWrapper.style.display = 'none';
        }
    }

    // --- HIỂN THỊ ERROR STATE ---
    function showErrorState(errorMessage) {
        const listContainer = document.querySelector('.list-1 ul');
        if (listContainer) {
            listContainer.innerHTML = `
                <li class="text-center text-danger" style="padding: 20px;">
                    <i class="fi fi-rr-cross-circle"></i><br>
                    <small>${errorMessage}</small>
                </li>`;
        }

        const tbody = document.querySelector('.transaction-table tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-danger" style="padding: 40px;">
                        <i class="fi fi-rr-cross-circle" style="font-size: 48px;"></i>
                        <p class="mt-2">Lỗi tải dữ liệu</p>
                        <small>${errorMessage}</small>
                    </td>
                </tr>
            `;
        }

        // Hide pagination khi có lỗi
        const paginationWrapper = document.getElementById('paginationWrapper');
        if (paginationWrapper) {
            paginationWrapper.style.display = 'none';
        }
    }

    // --- CẬP NHẬT TỔNG CHI TIÊU ---
    function updateTotalExpense(total) {
        const totalExpenseEl = document.getElementById('totalExpense');
        if (totalExpenseEl) {
            totalExpenseEl.textContent = `Tổng: ${Number(total).toLocaleString()}đ`;
        }
    }

    // --- VẼ PIE CHART ---
    function renderExpensePieChart(breakdown) {
        const canvas = document.getElementById('chartjsExpense');
        if (!canvas) {
            console.warn('⚠️ Không tìm thấy canvas #chartjsExpense');
            return;
        }

        // Xóa chart cũ
        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }

        // Nếu không có dữ liệu
        if (!breakdown || breakdown.length === 0) {
            canvas.style.display = "none";

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
            canvas.style.display = "block";
            const noDataEl = document.querySelector(".chart-no-data");
            if (noDataEl) noDataEl.remove();
        }

        const labels = breakdown.map(x => x.categoryName || x.CategoryName || 'Khác');
        const data = breakdown.map(x => Number(x.amount || x.Amount || 0));
        const colors = breakdown.map(x => x.colorHex || x.ColorHex || '#808080');

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
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value.toLocaleString()}đ`;
                            }
                        }
                    }
                }
            }
        });

        console.log('✅ Pie chart rendered với', breakdown.length, 'categories');
    }

    // --- VẼ DANH SÁCH BREAKDOWN ---
    function renderBreakdownList(breakdown) {
        const listContainer = document.querySelector('.list-1 ul');
        if (!listContainer) {
            console.warn('⚠️ Không tìm thấy .list-1 ul');
            return;
        }

        listContainer.innerHTML = '';

        if (!breakdown || breakdown.length === 0) {
            listContainer.innerHTML = `
                <li class="no-data-display">
                    <i class="fi fi-rr-document" style="font-size: 38px; opacity: .4;"></i>
                    <p class="mt-2 mb-0 text-muted">Không có dữ liệu để hiển thị</p>
                </li>`;
            return;
        }

        breakdown.forEach(item => {
            const categoryName = item.categoryName || item.CategoryName || 'Khác';
            const amount = Number(item.amount || item.Amount || 0);
            const percentage = Number(item.percentage || item.Percentage || 0);
            const colorHex = item.colorHex || item.ColorHex || '#808080';

            const li = document.createElement('li');
            li.innerHTML = `
                <p class="mb-0">
                    <span style="display:inline-block; width:12px; height:12px; background:${colorHex}; border-radius:2px; margin-right:8px;"></span>
                    ${categoryName}
                </p>
                <h5 class="mb-0">
                    <span>${amount.toLocaleString()}đ</span>
                    ${percentage}%
                </h5>
            `;
            listContainer.appendChild(li);
        });

        console.log('✅ Breakdown list rendered với', breakdown.length, 'items');
    }

    // --- VẼ BẢNG LỊCH SỬ ---
    function renderTransactionTable(history) {
        const tbody = document.querySelector('.transaction-table tbody');
        if (!tbody) {
            console.warn('⚠️ Không tìm thấy .transaction-table tbody');
            return;
        }

        tbody.innerHTML = '';

        if (!history || history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted" style="padding: 40px;">
                        <i class="fi fi-rr-document" style="font-size: 48px; opacity: 0.3;"></i>
                        <p class="mt-2 mb-0">Chưa có giao dịch nào trong kỳ này</p>
                    </td>
                </tr>
            `;
            return;
        }

        history.forEach((tx, index) => {
            const transactionDate = tx.transactionDate || tx.TransactionDate;
            const amount = Number(tx.amount || tx.Amount || 0);
            const description = tx.description || tx.Description || '-';

            const category = tx.category || tx.Category || {};
            const categoryName = category.categoryName || category.CategoryName || 'Khác';

            const icon = category.icon || category.Icon || {};
            const iconClass = icon.iconClass || icon.IconClass || 'fi fi-rr-circle-question';

            const color = category.color || category.Color || {};
            const colorHex = color.hexCode || color.HexCode || '#999';

            const date = new Date(transactionDate);
            const formattedDate = date.toLocaleDateString('vi-VN');

            const row = document.createElement('tr');
            row.style.animation = `fadeIn 0.3s ease-in-out ${index * 0.05}s`;
            row.style.opacity = '0';
            row.style.animationFillMode = 'forwards';

            row.innerHTML = `
                <td>
                    <span class="table-category-icon">
                        <i class="${iconClass}" style="color: ${colorHex}"></i>
                        ${categoryName}
                    </span>
                </td>
                <td>${formattedDate}</td>
                <td>${description}</td>
                <td class="text-danger text-end fw-bold">-${amount.toLocaleString()}đ</td>
            `;

            tbody.appendChild(row);
        });

        console.log('✅ Transaction table rendered với', history.length, 'giao dịch');
    }

    // ===== ✅ RENDER PAGINATION =====
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
        const pageSize = 7;
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
                    loadAnalytics(page);

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

    // ===== HÀM TÍNH TOÁN PAGE NUMBERS =====
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