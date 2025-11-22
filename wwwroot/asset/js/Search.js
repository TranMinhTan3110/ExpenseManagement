document.addEventListener('DOMContentLoaded', async function () {
    const searchKeyword = document.getElementById('searchKeyword');
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const filterFromDate = document.getElementById('filterFromDate');
    const filterToDate = document.getElementById('filterToDate');
    const btnSearch = document.getElementById('btnSearch');
    const btnReset = document.getElementById('btnReset');
    const resultCount = document.getElementById('resultCount');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const paginationContainer = document.getElementById('paginationContainer');

    // Biến lưu trạng thái phân trang
    let currentPage = 1;
    let pageSize = 10;
    let totalPages = 0;

    // Load categories cho filter
    await loadCategories();

    // Tự động search nếu có query từ header
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery) {
        searchKeyword.value = initialQuery;
        await performSearch(1);
    } else {
        // Load tất cả transactions gần đây
        await performSearch(1);
    }

    // Event listeners
    btnSearch.addEventListener('click', () => performSearch(1));
    btnReset.addEventListener('click', resetFilters);

    // Enter key trong search box
    searchKeyword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch(1);
        }
    });

    // Change page size
    window.changePageSize = function (newSize) {
        pageSize = parseInt(newSize);
        performSearch(1);
    };

    // Go to page
    window.goToPage = function (page) {
        if (page >= 1 && page <= totalPages) {
            performSearch(page);
        }
    };

    // --- LOAD CATEGORIES ---
    async function loadCategories() {
        try {
            const response = await fetch('/api/search/categories');
            if (!response.ok) throw new Error('Lỗi tải categories');

            const categories = await response.json();

            filterCategory.innerHTML = '<option value="">Tất cả danh mục</option>';
            categories.forEach(cat => {
                const name = cat.categoryName || cat.CategoryName;
                const id = cat.categoryID || cat.CategoryID;
                filterCategory.innerHTML += `<option value="${id}">${name}</option>`;
            });
        } catch (error) {
            console.error('Lỗi load categories:', error);
        }
    }

    // --- PERFORM SEARCH ---
    async function performSearch(page = 1) {
        try {
            currentPage = page;

            // Show loading
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fi fi-rr-spinner"></i>
                    <p>Đang tìm kiếm...</p>
                </div>
            `;
            resultCount.textContent = 'Đang tìm kiếm...';
            paginationContainer.innerHTML = '';

            // Build query params
            const params = new URLSearchParams();

            const keyword = searchKeyword.value.trim();
            if (keyword) params.append('q', keyword);

            const type = filterType.value;
            if (type) params.append('type', type);

            const categoryId = filterCategory.value;
            if (categoryId) params.append('categoryId', categoryId);

            const fromDate = filterFromDate.value;
            if (fromDate) params.append('fromDate', fromDate);

            const toDate = filterToDate.value;
            if (toDate) params.append('toDate', toDate);

            // Thêm pagination params
            params.append('page', page);
            params.append('pageSize', pageSize);

            console.log('🔍 Searching with params:', params.toString());

            // Call API
            const response = await fetch(`/api/search/transactions?${params.toString()}`);
            if (!response.ok) throw new Error('Lỗi tìm kiếm');

            const data = await response.json();
            const transactions = data.transactions || data.Transactions || [];
            const total = data.totalCount || data.TotalCount || 0;
            totalPages = data.totalPages || 0;

            console.log('✅ Found', total, 'transactions, page', page, '/', totalPages);

            // Display results
            displayResults(transactions, total, page);
            displayPagination(page, totalPages, data.hasNextPage, data.hasPreviousPage);

        } catch (error) {
            console.error('❌ Search error:', error);
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fi fi-rr-cross-circle"></i>
                    <p>Lỗi tìm kiếm: ${error.message}</p>
                </div>
            `;
            resultCount.textContent = 'Lỗi tìm kiếm';
            paginationContainer.innerHTML = '';
        }
    }

    // --- DISPLAY RESULTS ---
    function displayResults(transactions, total, page) {
        const startIndex = (page - 1) * pageSize + 1;
        const endIndex = Math.min(page * pageSize, total);

        resultCount.textContent = `Tìm thấy ${total} giao dịch (hiển thị ${startIndex}-${endIndex})`;

        if (transactions.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fi fi-rr-search"></i>
                    <p>Không tìm thấy giao dịch nào</p>
                    <small class="text-muted">Thử thay đổi điều kiện tìm kiếm</small>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = '';

        transactions.forEach(tx => {
            const amount = Number(tx.amount || tx.Amount || 0);
            const type = tx.type || tx.Type || 'Expense';
            const description = tx.description || tx.Description || '-';
            const transactionDate = tx.transactionDate || tx.TransactionDate;

            const category = tx.category || tx.Category || {};
            const categoryName = category.categoryName || category.CategoryName || 'Khác';

            const icon = category.icon || category.Icon || {};
            const iconClass = icon.iconClass || icon.IconClass || 'fi fi-rr-circle-question';

            const color = category.color || category.Color || {};
            const colorHex = color.hexCode || color.HexCode || '#999';

            const date = new Date(transactionDate);
            const formattedDate = date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const amountClass = type === 'Expense' ? 'expense' : 'income';
            const amountSign = type === 'Expense' ? '-' : '+';

            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.innerHTML = `
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="result-category">
                            <i class="${iconClass}" style="color: ${colorHex}"></i>
                            <div>
                                <strong>${categoryName}</strong>
                                <div class="text-muted small">${description}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 text-muted small">
                        <i class="fi fi-rr-calendar"></i> ${formattedDate}
                    </div>
                    <div class="col-md-3 text-end">
                        <span class="result-amount ${amountClass}">
                            ${amountSign}${amount.toLocaleString()}đ
                        </span>
                        <div class="text-muted small">${type === 'Expense' ? 'Chi tiêu' : 'Thu nhập'}</div>
                    </div>
                </div>
            `;

            resultsContainer.appendChild(card);
        });

        console.log('✅ Displayed', transactions.length, 'results');
    }

    // --- DISPLAY PAGINATION ---
    function displayPagination(currentPage, totalPages, hasNext, hasPrev) {
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '<nav aria-label="Search pagination"><ul class="pagination justify-content-center">';

        // Page size selector
        //html += `
        //    <li class="page-item">
        //        <select class="form-select form-select-sm" style="width: auto; margin-right: 10px;" onchange="changePageSize(this.value)">
        //            <option value="10" ${pageSize === 10 ? 'selected' : ''}>10/trang</option>
        //            <option value="20" ${pageSize === 20 ? 'selected' : ''}>20/trang</option>
        //            <option value="50" ${pageSize === 50 ? 'selected' : ''}>50/trang</option>
        //            <option value="100" ${pageSize === 100 ? 'selected' : ''}>100/trang</option>
        //        </select>
        //    </li>
        //`;

        // Previous button
        html += `
            <li class="page-item ${!hasPrev ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">
                    <i class="fi fi-rr-angle-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // First page
        if (startPage > 1) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="goToPage(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${!hasNext ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">
                    <i class="fi fi-rr-angle-right"></i>
                </a>
            </li>
        `;

        html += '</ul></nav>';

        paginationContainer.innerHTML = html;
    }

    // --- RESET FILTERS ---
    function resetFilters() {
        searchKeyword.value = '';
        filterType.value = '';
        filterCategory.value = '';
        filterFromDate.value = '';
        filterToDate.value = '';

        // Search lại với filters rỗng
        performSearch(1);
    }
});