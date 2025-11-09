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

    // Load categories cho filter
    await loadCategories();

    // Tự động search nếu có query từ header
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    if (initialQuery) {
        searchKeyword.value = initialQuery;
        await performSearch();
    } else {
        // Load tất cả transactions gần đây
        await performSearch();
    }

    // Event listeners
    btnSearch.addEventListener('click', performSearch);
    btnReset.addEventListener('click', resetFilters);

    // Enter key trong search box
    searchKeyword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

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
    async function performSearch() {
        try {
            // Show loading
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fi fi-rr-spinner"></i>
                    <p>Đang tìm kiếm...</p>
                </div>
            `;
            resultCount.textContent = 'Đang tìm kiếm...';

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

            console.log('🔍 Searching with params:', params.toString());

            // Call API
            const response = await fetch(`/api/search/transactions?${params.toString()}`);
            if (!response.ok) throw new Error('Lỗi tìm kiếm');

            const data = await response.json();
            const transactions = data.transactions || data.Transactions || [];
            const total = data.totalCount || data.TotalCount || 0;

            console.log('✅ Found', total, 'transactions');

            // Display results
            displayResults(transactions, total);

        } catch (error) {
            console.error('❌ Search error:', error);
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fi fi-rr-cross-circle"></i>
                    <p>Lỗi tìm kiếm: ${error.message}</p>
                </div>
            `;
            resultCount.textContent = 'Lỗi tìm kiếm';
        }
    }

    // --- DISPLAY RESULTS ---
    function displayResults(transactions, total) {
        resultCount.textContent = `Tìm thấy ${total} giao dịch`;

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

    // --- RESET FILTERS ---
    function resetFilters() {
        searchKeyword.value = '';
        filterType.value = '';
        filterCategory.value = '';
        filterFromDate.value = '';
        filterToDate.value = '';

        // Search lại với filters rỗng
        performSearch();
    }
});