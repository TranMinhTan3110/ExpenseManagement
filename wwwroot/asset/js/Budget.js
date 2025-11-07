// Budget.js - UPDATED WITH BAR CHART

// ============= GLOBAL VARIABLES =============
let activeCharts = {}; // Store chart instances

// ============= GLOBAL FUNCTIONS =============
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
    Swal.fire({
        icon: 'info',
        title: 'Chức năng đang phát triển',
        text: 'Edit Budget đang được phát triển...'
    });
};

// ============= UPDATE CHART FILTERS =============
window.updateChartFilters = async function (budgetId) {
    const groupBy = document.getElementById(`groupBy${budgetId}`)?.value || 'day';
    const startDate = document.getElementById(`chartStartDate${budgetId}`)?.value;
    const endDate = document.getElementById(`chartEndDate${budgetId}`)?.value;

    await renderSpendingChart(budgetId, groupBy, startDate, endDate);
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

        renderBudgetNav(budgets);
        renderBudgetTabs(budgets);

        // Render charts and timeline for all budgets
        budgets.forEach(budget => {
            renderBudgetDoughnutChart(budget);
            renderSpendingChart(budget.budgetID, 'day', budget.startDate, budget.endDate);
            renderBudgetTimeline(budget);
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
                        <p>$${budget.budgetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', navItem);
    });

    const addBudgetBtn = `
        <div class="col-xl-12 col-md-6">
            <div class="add-budgets-link">
                <div class="budgets-nav-text"> 
                    <h3 class="budgets-nav-title">Add new budget</h3> 
                </div> 
                <div class="add-link-image" data-bs-toggle="modal" data-bs-target="#addBudgetModal">
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

        // Format dates for input fields
        const formatDateForInput = (dateStr) => {
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        const tabPane = `
            <div class="tab-pane ${index === 0 ? 'show active' : ''}" id="budget-${budget.budgetID}">
                <!-- Title with Edit/Delete buttons -->
                <div class="budgets-tab-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${budget.categoryName}</h3>
                    <div style="display: flex; gap: 5px;">
                        <button type="button" class="btn btn-edit" onclick="editBudget(${budget.budgetID})" title="Edit">
                            <i class="bi bi-pencil"></i>
                            <span>Edit</span>
                        </button>
                        <button type="button" class="btn btn-del" onclick="deleteBudget(${budget.budgetID}, '${budget.categoryName}')" title="Delete">
                            <i class="bi bi-trash"></i>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>

                <div class="row">
                    <!-- Budget Progress -->
                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span style="color: #7184AD; font-size: 14px;">Đã chi</span>
                                    <h3 style="font-weight: bold;">$${budget.spentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                </div>
                                <div class="text-end">
                                    <span style="color: #7184AD; font-size: 14px;">Ngân sách</span>
                                    <h3 style="font-weight: bold;">$${budget.budgetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar" style="width: ${percentage}%; background-color: ${progressColor};" role="progressbar"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>${percentage}%</span>
                                <span>Còn lại: $${budget.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Budget Stats -->
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
                                        <h3>$${budget.spentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Còn lại</p>
                                        <h3 style="color: ${budget.remainingAmount < 0 ? '#dc3545' : '#28a745'}">
                                            $${budget.remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Doughnut Chart -->
                    <div class="col-xl-6">
                        <div class="card">
                            <div class="card-header">
                                <h4>Tỷ Lệ Sử Dụng</h4>
                            </div>
                            <div class="card-body" style="height: 300px;">
                                <canvas id="chartDoughnut${budget.budgetID}"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="col-xl-6">
                        <div class="card">
                            <div class="card-header">
                                <h4>Giao Dịch Gần Đây</h4>
                            </div>
                            <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                                <div id="timeline${budget.budgetID}">
                                    <div class="text-center py-3">
                                        <div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Spending Analysis Chart -->
                    <div class="col-xl-12">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <h4>Phân Tích Chi Tiêu</h4>
                                
                                <!-- Filters -->
                                <div class="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                                    <!-- Group By Select -->
                                    <select id="groupBy${budget.budgetID}" class="form-select form-select-sm" style="width: auto;" onchange="updateChartFilters(${budget.budgetID})">
                                        <option value="day">Theo Ngày</option>
                                        <option value="week">Theo Tuần</option>
                                        <option value="month">Theo Tháng</option>
                                    </select>

                                    <!-- Date Range -->
                                    <input type="date" id="chartStartDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.startDate)}" 
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                    <span class="align-self-center">đến</span>
                                    <input type="date" id="chartEndDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.endDate)}"
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                    
                                    <!-- Refresh Button -->
                                    <button type="button" class="btn btn-primary btn-sm" onclick="updateChartFilters(${budget.budgetID})" title="Cập nhật">
                                        <i class="bi bi-arrow-clockwise"></i>
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

// ============= RENDER DOUGHNUT CHART =============
function renderBudgetDoughnutChart(budget) {
    setTimeout(() => {
        const ctx = document.getElementById(`chartDoughnut${budget.budgetID}`);
        if (!ctx) return;

        const percentage = (budget.spentAmount / budget.budgetAmount * 100).toFixed(1);
        const chartColor = percentage >= 90 ? '#dc3545' : percentage >= 70 ? '#ffc107' : '#28a745';

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Đã chi', 'Còn lại'],
                datasets: [{
                    data: [budget.spentAmount, Math.max(0, budget.remainingAmount)],
                    backgroundColor: [chartColor, '#e9ecef'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return context.label + ': $' + value.toFixed(2) + ' (' + percent + '%)';
                            }
                        }
                    }
                },
                cutout: '65%'
            },
            plugins: [{
                id: 'centerText',
                afterDraw: (chart) => {
                    const { ctx, chartArea: { left, top, width, height } } = chart;
                    ctx.save();
                    ctx.font = 'bold 28px Arial';
                    ctx.fillStyle = '#333';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(percentage + '%', left + width / 2, top + height / 2 - 12);
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#666';
                    ctx.fillText('Đã sử dụng', left + width / 2, top + height / 2 + 18);
                    ctx.restore();
                }
            }]
        });
    }, 200);
}

// ============= RENDER SPENDING CHART (NEW) =============
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

        // Destroy existing chart if exists
        if (activeCharts[budgetId]) {
            activeCharts[budgetId].destroy();
        }

        const labels = result.data.map(d => d.label);
        const amounts = result.data.map(d => d.amount);

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
                    hoverBackgroundColor: '#1e1b9f'
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
                                return 'Chi tiêu: $' + context.parsed.y.toFixed(2);
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
                                return '$' + value.toFixed(0);
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

// ============= RENDER TIMELINE =============
async function renderBudgetTimeline(budget) {
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/BudgetApi/transactions/${budget.budgetID}`);
            if (!response.ok) throw new Error('Failed to load transactions');

            const transactions = await response.json();
            const container = document.getElementById(`timeline${budget.budgetID}`);

            if (!container) return;

            if (transactions.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-inbox" style="font-size: 48px; color: #ccc;"></i>
                        <p class="text-muted mt-2 mb-0">Chưa có giao dịch nào</p>
                    </div>
                `;
                return;
            }

            const timelineHtml = transactions.map(t => `
                <div class="timeline-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <span class="text-muted small">${new Date(t.date).toLocaleDateString('vi-VN')}</span>
                        <p class="mb-0 fw-medium">${t.description || 'Giao dịch'}</p>
                    </div>
                    <div class="text-end">
                        <span class="badge ${t.type === 'Expense' ? 'bg-danger' : 'bg-success'}">
                            ${t.type === 'Expense' ? '-' : '+'}$${t.amount.toFixed(2)}
                        </span>
                    </div>
                </div>
            `).join('');

            container.innerHTML = timelineHtml;

        } catch (error) {
            console.error('Error loading timeline:', error);
            const container = document.getElementById(`timeline${budget.budgetID}`);
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-3 text-danger">
                        <i class="bi bi-exclamation-circle"></i>
                        <p class="mb-0 small">Không thể tải giao dịch</p>
                    </div>
                `;
            }
        }
    }, 300);
}

// ============= DOM CONTENT LOADED =============
document.addEventListener("DOMContentLoaded", async function () {

    // 1) LOAD BUDGETS FIRST
    await loadBudgets();

    // 2) CATEGORY PICKER
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

    // 3) QUICK RANGE BUTTONS
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

    // 4) SUBMIT ADD BUDGET FORM (continued)
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
                    document.activeElement?.blur();

                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    } else {
                        const newModal = new bootstrap.Modal(modalElement);
                        newModal.hide();
                    }

                    modalElement.addEventListener("hidden.bs.modal", () => {
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

                        loadBudgets();
                    }, { once: true });
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