
// ============= GLOBAL VARIABLES =============
let activeCharts = {};

// ============= GLOBAL FUNCTIONS =============

function formatCurrencyVND(amount) {
    if (isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

window.deleteBudget = async function (budgetId, categoryName) {
    const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ngân sách "${categoryName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/BudgetApi/${budgetId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Delete failed');

        await Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Ngân sách đã được xóa thành công',
            confirmButtonColor: '#28a745',
            timer: 2000
        });

        await loadBudgets();

    } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xóa ngân sách!',
            confirmButtonColor: '#d33'
        });
    }
};

window.editBudget = function (budgetId) {
    // TODO: Implement edit functionality
    Swal.fire({
        icon: 'info',
        title: 'Chức năng đang phát triển',
        text: 'Edit Budget đang được phát triển...'
    });
};

window.updateChartFilters = async function (budgetId) {
    const groupBy = document.getElementById(`groupBy${budgetId}`)?.value || 'day';
    const startDate = document.getElementById(`chartStartDate${budgetId}`)?.value;
    const endDate = document.getElementById(`chartEndDate${budgetId}`)?.value;

    await renderSpendingChart(budgetId, groupBy, startDate, endDate);
};

window.openAddBudgetModal = function () {
    const modalElement = document.getElementById("addBudgetModal");
    if (modalElement) {
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.removeAttribute('aria-hidden');
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// ============= LOAD BUDGETS =============
async function loadBudgets() {
    try {
        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        const response = await fetch(`/api/BudgetApi?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const budgets = await response.json();
        console.log("Loaded budgets:", budgets);

        if (!budgets || budgets.length === 0) {
            renderEmptyState();
            return;
        }

        renderBudgetNav(budgets);
        renderBudgetTabs(budgets);

        budgets.forEach(budget => {
            renderSpendingChart(budget.budgetID, 'day', budget.startDate, budget.endDate);
        });

    } catch (error) {
        console.error("Error loading budgets:", error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải danh sách ngân sách!',
            confirmButtonColor: '#d33'
        });
    }
}

// ============= RENDER EMPTY STATE =============
function renderEmptyState() {
    const navContainer = document.querySelector('.budgets-tab .nav .row');
    if (navContainer) {
        navContainer.innerHTML = `
            <div class="col-xl-12 col-md-6">
                <div class="add-budgets-link" onclick="openAddBudgetModal()">
                    <div class="budgets-nav-text"> 
                        <h3 class="budgets-nav-title">Add new budget</h3> 
                    </div> 
                    <div class="add-link-image">
                        <span><img src="/asset/img/more.png" alt=""></span> 
                    </div> 
                </div>
            </div>

            <div class="col-xl-12">
                <div class="text-center py-4">
                    <i class="bi bi-wallet2" style="font-size: 64px; color: #ccc;"></i>
                    <h5 class="mt-3 text-muted">Chưa có ngân sách nào</h5>
                    <p class="text-muted small">Tạo ngân sách đầu tiên của bạn</p>
                </div>
            </div>
        `;
    }

    const tabContent = document.querySelector('.budgets-tab-content');
    if (tabContent) {
        tabContent.innerHTML = `
            <div class="tab-pane show active">
                <div class="budgets-tab-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">N/A</h3>
                </div>

                <div class="row">
                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span style="color: #7184AD; font-size: 14px;">Đã chi</span>
                                    <h3 style="font-weight: bold;">N/A</h3>
                                </div>
                                <div class="text-end">
                                    <span style="color: #7184AD; font-size: 14px;">Ngân sách</span>
                                    <h3 style="font-weight: bold;">N/A</h3>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar" style="width: 0%; background-color: #e9ecef;" role="progressbar"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>0%</span>
                                <span>Còn lại: N/A</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-12">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày bắt đầu</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày kết thúc</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Đã chi</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Còn lại</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <h4 class="card-title mb-0">Phân Tích Chi Tiêu</h4>
                                <div class="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                                    <select class="form-select form-select-sm" style="width: auto;" disabled>
                                        <option>Theo Ngày</option>
                                    </select>
                                    <input type="date" class="form-control form-control-sm" style="width: 150px;" disabled>
                                    <span class="align-self-center">đến</span>
                                    <input type="date" class="form-control form-control-sm" style="width: 150px;" disabled>
                                    <button type="button" class="btn btn-sm btn-danger rounded" disabled>
                                        <i class="bi bi-arrow-clockwise"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body" style="height: 400px;">
                                <div class="d-flex justify-content-center align-items-center h-100">
                                    <div class="text-center">
                                        <i class="bi bi-bar-chart" style="font-size: 64px; color: #ccc;"></i>
                                        <p class="text-muted mt-3 mb-0">Chưa có dữ liệu phân tích</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============= RENDER BUDGET NAV =============




function renderBudgetNav(budgets) {
    const navContainer = document.querySelector('.budgets-tab .nav .row');
    if (!navContainer) return;

    navContainer.innerHTML = '';

    budgets.forEach((budget, index) => {
        const navItem = `
            <div class="col-xl-12 col-md-6">
                <div class="budgets-nav ${index === 0 ? 'active' : ''}" 
                     data-bs-toggle="pill" 
                     data-bs-target="#budget-${budget.budgetID}">
                    <div class="budgets-nav-icon">
                        <span><i class="${budget.categoryIcon}" style="color: ${budget.categoryColor}"></i></span>
                    </div>
                    <div class="budgets-nav-text">
                        <h3 class="budgets-nav-title">${budget.categoryName}</h3>
                        <p>${formatCurrencyVND(budget.budgetAmount)}</p>

                    </div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', navItem);
    });

    const addBudgetBtn = `
        <div class="col-xl-12 col-md-6">
            <div class="add-budgets-link" onclick="openAddBudgetModal()">
                <div class="budgets-nav-text"> 
                    <h3 class="budgets-nav-title">Add new budget</h3> 
                </div> 
                <div class="add-link-image">
                    <span><img src="/asset/img/more.png" alt=""></span> 
                </div> 
            </div>
        </div>
    `;
    navContainer.insertAdjacentHTML('beforeend', addBudgetBtn);
}

// ============= RENDER BUDGET TABS =============
function renderBudgetTabs(budgets) {
    const tabContent = document.querySelector('.budgets-tab-content');
    if (!tabContent) return;

    tabContent.innerHTML = '';

    budgets.forEach((budget, index) => {
        const percentage = budget.percentage > 100 ? 100 : budget.percentage;
        const progressColor = percentage >= 90 ? '#dc3545' : percentage >= 70 ? '#ffc107' : '#28a745';

        const formatDateForInput = (dateStr) => {
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        const tabPane = `
            <div class="tab-pane ${index === 0 ? 'show active' : ''}" id="budget-${budget.budgetID}">
                <div class="budgets-tab-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${budget.categoryName}</h3>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary me-2 rounded" onclick="editBudget(${budget.budgetID})">
                            <i class="fi fi-rr-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger rounded" onclick="deleteBudget(${budget.budgetID}, '${budget.categoryName}')">
                            <i class="fi fi-rr-trash"></i> Xóa
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span style="color: #7184AD; font-size: 14px;">Đã chi</span>
                                    <h3 style="font-weight: bold;">${formatCurrencyVND(budget.spentAmount)}</h3>
                                </div>
                                <div class="text-end">
                                    <span style="color: #7184AD; font-size: 14px;">Ngân sách</span>
                                    <h3 style="font-weight: bold;">${formatCurrencyVND(budget.budgetAmount)}</h3>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar" style="width: ${percentage}%; background-color: ${progressColor};" role="progressbar"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>${percentage}%</span>
                                <span>Còn lại: ${formatCurrencyVND(budget.remainingAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-12">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày bắt đầu</p>
                                        <h3>${new Date(budget.startDate).toLocaleDateString('vi-VN')}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày kết thúc</p>
                                        <h3>${new Date(budget.endDate).toLocaleDateString('vi-VN')}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Đã chi</p>
                                        <h3>${formatCurrencyVND(budget.spentAmount)}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Còn lại</p>
                                        <h3 style="color: ${budget.remainingAmount < 0 ? '#dc3545' : '#28a745'}">
                                            ${formatCurrencyVND(budget.remainingAmount)}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <h4 class="card-title mb-0">Phân Tích Chi Tiêu</h4>
                                
                                <div class="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                                    <select id="groupBy${budget.budgetID}" class="form-select form-select-sm" style="width: auto;" onchange="updateChartFilters(${budget.budgetID})">
                                        <option value="day">Theo Ngày</option>
                                        <option value="week">Theo Tuần</option>
                                        <option value="month">Theo Tháng</option>
                                    </select>
                                    <input type="date" id="chartStartDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.startDate)}" 
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                    <span class="align-self-center">đến</span>
                                    <input type="date" id="chartEndDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.endDate)}"
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                    <button class="btn btn-sm btn-primary me-2 rounded" onclick="updateChartFilters(${budget.budgetID})" title="Cập nhật">
                                        <i class="fi fi-rr-edit"></i> Cập nhật
                                    </button>
                                </div>
                            </div>
                            <div class="card-body" style="height: 400px;">
                                <canvas id="chartSpending${budget.budgetID}"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        tabContent.insertAdjacentHTML('beforeend', tabPane);
    });
}

// ============= RENDER SPENDING CHART (UPDATED WITH DYNAMIC BAR WIDTH) =============
async function renderSpendingChart(budgetId, groupBy = 'day', startDate = null, endDate = null) {
    try {
        let url = `/api/BudgetApi/spending-analysis/${budgetId}?groupBy=${groupBy}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load spending data');

        const result = await response.json();
        const ctx = document.getElementById(`chartSpending${budgetId}`);

        if (!ctx) return;

        if (activeCharts[budgetId]) {
            activeCharts[budgetId].destroy();
        }

        if (!result.data || result.data.length === 0) {
            ctx.parentElement.innerHTML = `
                <div class="d-flex justify-content-center align-items-center h-100">
                    <div class="text-center">
                        <i class="bi bi-bar-chart" style="font-size: 64px; color: #ccc;"></i>
                        <p class="text-muted mt-3 mb-0">Chưa có dữ liệu trong khoảng thời gian này</p>
                    </div>
                </div>
            `;
            return;
        }

        const labels = result.data.map(d => d.label);
        const amounts = result.data.map(d => d.amount);

        // ✅ CALCULATE DYNAMIC BAR WIDTH
        const dataCount = labels.length;
        let barPercentage = 0.8;
        let categoryPercentage = 0.9;

        if (dataCount <= 5) {
            // Ít cột (<=5): Mỗi cột chiếm ~20% chiều rộng
            barPercentage = 0.2;
            categoryPercentage = 0.3;
        } else if (dataCount <= 10) {
            // Trung bình (6-10): Mỗi cột chiếm ~15%
            barPercentage = 0.5;
            categoryPercentage = 0.6;
        } else {
            // Nhiều cột (>10): Thu nhỏ để fit
            barPercentage = 0.8;
            categoryPercentage = 0.9;
        }

        activeCharts[budgetId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Chi tiêu ($)',
                    data: amounts,
                    backgroundColor: '#2F2CD8',
                    borderColor: '#2F2CD8',
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: '#1e1b9f',
                    barPercentage: barPercentage,
                    categoryPercentage: categoryPercentage
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
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return 'Chi tiêu: ' + formatCurrencyVND(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#666',
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        },
                        ticks: {
                            color: '#666',
                            font: { size: 11 },
                            callback: function (value) {
                                return formatCurrencyVND(value);
                            }

                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error rendering spending chart:', error);
        const ctx = document.getElementById(`chartSpending${budgetId}`);
        if (ctx && ctx.parentElement) {
            ctx.parentElement.innerHTML = `
                <div class="text-center py-5 text-danger">
                    <i class="bi bi-exclamation-circle" style="font-size: 48px;"></i>
                    <p class="mt-2 mb-0">Không thể tải dữ liệu biểu đồ</p>
                </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", async function () {

    // 1) LOAD BUDGETS FIRST
    await loadBudgets();

    // 2) FIX MODAL EVENT LISTENERS
    const modalElement = document.getElementById("addBudgetModal");
    if (modalElement) {
        modalElement.addEventListener('show.bs.modal', function () {
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.removeAttribute('aria-hidden');
            }
        });

        modalElement.addEventListener('hidden.bs.modal', function () {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.removeAttribute('aria-hidden');
            }

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }

    // 3) CATEGORY PICKER
    const categoryToggle = document.getElementById("categoryPickerToggle");
    const categoryList = document.getElementById("categoryPickerList");
    const categoryContainer = document.getElementById("categoryPickerContainer");
    const categoryPreview = document.getElementById("selectedCategoryPreview");
    const hiddenInput = document.getElementById("selectedCategoryID");

    if (categoryToggle && categoryContainer) {
        try {
            const res = await fetch("/api/category/page-data");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const resData = await res.json();

            const expenseCategories = (resData.userCategories || []).filter(c =>
                (c.type || "").toLowerCase().startsWith("exp")
            );

            categoryContainer.innerHTML = expenseCategories.map(cat => {
                const iconClass = (cat.icon && cat.icon.iconClass) ? cat.icon.iconClass : "fi fi-rr-ellipsis";
                const name = cat.categoryName || "Category";
                return `
                    <div class="category-option border rounded p-2 text-center"
                         data-id="${cat.categoryID}"
                         data-icon="${iconClass}"
                         title="${name}"
                         style="width:80px; cursor:pointer;">
                        <i class="${iconClass}" style="font-size:22px;"></i>
                        <div class="small mt-1">${name}</div>
                    </div>
                `;
            }).join("");
        } catch (err) {
            console.error("❌ Lỗi khi tải categories:", err);
            categoryContainer.innerHTML = `<div class="text-muted small">Không tải được categories</div>`;
        }

        if (categoryList) {
            categoryToggle.addEventListener("click", () => {
                const cur = window.getComputedStyle(categoryList).display;
                categoryList.style.display = (cur === "none" ? "block" : "none");
            });
        }

        categoryContainer.addEventListener("click", (e) => {
            const item = e.target.closest(".category-option");
            if (!item) return;

            categoryContainer.querySelectorAll(".category-option")
                .forEach(el => el.classList.remove("active"));
            item.classList.add("active");

            const iconClass = item.dataset.icon;
            const label = item.getAttribute("title") || "Category";
            if (categoryPreview) {
                categoryPreview.innerHTML = `<i class="${iconClass}"></i> ${label}`;
                categoryPreview.classList.remove("text-muted");
            }
            if (hiddenInput) hiddenInput.value = item.dataset.id;
            if (categoryList) categoryList.style.display = "none";
        });
    }

    // 4) QUICK RANGE BUTTONS
    const rangeBtns = document.querySelectorAll(".range-btn");
    const startDateInput = document.getElementById("budgetStartDateInput");
    const endDateInput = document.getElementById("budgetEndDateInput");

    if (rangeBtns && rangeBtns.length && startDateInput && endDateInput) {
        const formatDate = (date) => date.toISOString().split("T")[0];

        rangeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                rangeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const range = parseInt(btn.getAttribute("data-range"), 10) || 0;
                const start = new Date();
                const end = new Date();
                end.setDate(start.getDate() + range);

                startDateInput.value = formatDate(start);
                endDateInput.value = formatDate(end);
            });
        });
    }
    // 5) SUBMIT ADD BUDGET FORM
    const form = document.getElementById("addBudgetForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userId = document.getElementById("userIdHidden")?.value;
            const categoryId = document.getElementById("selectedCategoryID")?.value;
            const amountRaw = document.getElementById("budgetAmountInput")?.value;
            const amount = amountRaw ? parseFloat(amountRaw) : 0;
            const start = document.getElementById("budgetStartDateInput")?.value;
            const end = document.getElementById("budgetEndDateInput")?.value;

            if (!categoryId) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin',
                    text: 'Vui lòng chọn danh mục!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Đang lưu...";
            }

            const newBudget = {
                userID: userId,
                categoryID: parseInt(categoryId, 10),
                budgetAmount: amount,
                startDate: start,
                endDate: end
            };

            try {
                const response = await fetch("/api/BudgetApi", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newBudget)
                });

                if (!response.ok) {
                    const text = await response.text().catch(() => null);
                    console.error("Thêm ngân sách lỗi:", response.status, text);

                    Swal.fire({
                        icon: 'error',
                        title: 'Thêm thất bại',
                        text: text || `Lỗi: ${response.status}`,
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#d33'
                    });
                    return;
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: 'Ngân sách đã được thêm thành công',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                    timerProgressBar: true
                });

                const modalElement = document.getElementById("addBudgetModal");
                if (modalElement) {
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }

                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    setTimeout(async () => {
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) backdrop.remove();

                        const appContainer = document.querySelector('.app-container');
                        if (appContainer) appContainer.removeAttribute('aria-hidden');

                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';

                        form.reset();
                        if (categoryPreview) {
                            categoryPreview.innerHTML = "Chọn categories...";
                            categoryPreview.classList.add("text-muted");
                        }

                        await loadBudgets();
                    }, 300);
                }

            } catch (err) {
                console.error("❌ Lỗi khi thêm ngân sách:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Có lỗi xảy ra',
                    text: 'Không thể kết nối đến server!',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#d33'
                });
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Lưu Ngân Sách";
                }
            }
        });
    }
});