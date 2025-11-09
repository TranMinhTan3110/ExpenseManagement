// --- LOAD DỮ LIỆU DASHBOARD ---
async function loadDashboardData(incomeDays = 7) {
    try {
        // ✅ CHỈ GỌI 2 API: 1 cho tổng quan (7 ngày), 1 cho Income chart (tùy chỉnh)
        const [overviewResponse, incomeResponse] = await Promise.all([
            fetch(`/api/dashboard?days=7`),  // ✅ Luôn 7 ngày cho overview + balance trends
            fetch(`/api/dashboard?days=${incomeDays}`)  // ✅ Theo dropdown cho Income vs Expenses
        ]);

        if (!overviewResponse.ok || !incomeResponse.ok) {
            throw new Error('Không tải được dữ liệu');
        }

        const overviewData = await overviewResponse.json();
        const incomeData = await incomeResponse.json();

        // Render 3 ô trên + breakdown + transactions + balance trends (từ overviewData)
        render3TopCards(overviewData);
        renderExpenseBreakdown(overviewData.expenseBreakdown);
        renderRecentTransactions(overviewData.recentTransactions);
        renderBalanceTrends(overviewData.balanceTrends, overviewData);

        // Render biểu đồ Income vs Expenses (từ incomeData)
        renderIncomeVsExpensesChart(incomeData.incomeVsExpenses);

        createOrUpdateGoalCharts();

    } catch (error) {
        console.error('Lỗi load dashboard:', error);
    }
}

// --- RENDER 3 Ô TRÊN (GIỮ NGUYÊN) ---
function render3TopCards(data) {
    document.getElementById('totalBalance').textContent = `${data.totalBalance.toLocaleString()}đ`;
    document.getElementById('monthlyIncome').textContent = `${data.monthlyIncome.toLocaleString()}đ`;
    document.getElementById('monthlyExpenses').textContent = `${data.monthlyExpenses.toLocaleString()}đ`;

    const balanceChangeEl = document.getElementById('balanceChange');

    if (data.isNewUser) {
        balanceChangeEl.className = 'card-change text-muted mb-0';
        balanceChangeEl.innerHTML = 'Chào mừng bạn bắt đầu!';
    } else {
        const trendIcon = data.balanceChangePercent >= 0 ? 'up' : 'down';
        const trendColor = data.balanceChangePercent >= 0 ? 'text-success' : 'text-danger';

        balanceChangeEl.className = `card-change ${trendColor} mb-0`;
        balanceChangeEl.innerHTML = `
            <i class="fa-solid fa-arrow-trend-${trendIcon} me-1"></i>
            <span>${Math.abs(data.balanceChangePercent.toFixed(2))}%</span> 
            <span class="text-muted ms-2">Tháng trước: ${data.lastMonthBalance.toLocaleString()}đ</span>
        `;
    }

    const incomeChangeEl = document.getElementById('incomeChange');
    if (data.isNewUser) {
        incomeChangeEl.className = 'card-change text-muted mb-0';
        incomeChangeEl.textContent = 'Chào mừng bạn!';
    } else {
        const icon = data.incomeChangePercent >= 0 ? 'up' : 'down';
        const color = data.incomeChangePercent >= 0 ? 'text-success' : 'text-danger';
        incomeChangeEl.className = `card-change ${color} mb-0`;
        incomeChangeEl.innerHTML = `
            <i class="fa-solid fa-arrow-trend-${icon} me-1"></i>
            <span>${Math.abs(data.incomeChangePercent.toFixed(2))}%</span>
        `;
    }

    const expenseChangeEl = document.getElementById('expenseChange');
    if (data.isNewUser) {
        expenseChangeEl.className = 'card-change text-muted mb-0';
        expenseChangeEl.textContent = 'Chào mừng bạn!';
    } else {
        const icon = data.expenseChangePercent >= 0 ? 'up' : 'down';
        const color = data.expenseChangePercent >= 0 ? 'text-danger' : 'text-success';
        expenseChangeEl.className = `card-change ${color} mb-0`;
        expenseChangeEl.innerHTML = `
            <i class="fa-solid fa-arrow-trend-${icon} me-1"></i>
            <span>${Math.abs(data.expenseChangePercent.toFixed(2))}%</span>
        `;
    }
}

// --- RENDER EXPENSE BREAKDOWN (GIỮ NGUYÊN) ---
function renderExpenseBreakdown(breakdown) {
    const progressBar = document.querySelector('.multi-color-progress');
    const listContainer = document.querySelector('.expense-breakdown-list');

    if (!progressBar || !listContainer) return;

    progressBar.innerHTML = '';
    listContainer.innerHTML = '';

    if (breakdown.length === 0) {
        listContainer.innerHTML = '<p class="text-muted">Chưa có chi tiêu trong tháng này</p>';
        return;
    }

    breakdown.forEach(item => {
        progressBar.innerHTML += `
            <div class="progress-bar" role="progressbar" 
                 style="width: ${item.percentage}%; background-color: ${item.colorHex};">
            </div>
        `;
    });

    breakdown.forEach(item => {
        listContainer.innerHTML += `
            <div class="expense-item">
                <div class="expense-category">
                    <span class="category-dot" style="background-color: ${item.colorHex};"></span>
                    ${item.categoryName}
                </div>
                <div class="expense-details">
                    <span class="expense-amount">${item.amount.toLocaleString()}đ</span>
                    <span class="expense-percentage text-muted">${item.percentage}%</span>
                </div>
            </div>
        `;
    });
}

// --- RENDER RECENT TRANSACTIONS (GIỮ NGUYÊN) ---
function renderRecentTransactions(transactions) {
    const tbody = document.querySelector('.transaction-history tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Chưa có giao dịch nào</td></tr>';
        return;
    }

    transactions.forEach(tx => {
        const date = new Date(tx.transactionDate);
        const formattedDate = date.toLocaleDateString('vi-VN');

        const iconBg = tx.type === 'Income' ? 'bg-success-light text-success' : 'bg-danger-light text-danger';
        const amountClass = tx.type === 'Income' ? 'text-success' : 'text-danger';
        const amountSign = tx.type === 'Income' ? '+' : '-';

        tbody.innerHTML += `
            <tr>
                <td>
                    <span class="transaction-icon ${iconBg}">
                        <i class="${tx.iconClass}"></i>
                    </span>
                    <span class="category-name">${tx.categoryName}</span>
                </td>
                <td class="transaction-date">${formattedDate}</td>
                <td class="transaction-description">${tx.description || '-'}</td>
                <td class="transaction-amount ${amountClass} text-end">
                    ${amountSign}${tx.amount.toLocaleString()}đ
                </td>
            </tr>
        `;
    });
}

// =====================================
// BIỂU ĐỒ (CHARTS)
// =====================================

let balanceTrendChart = null;
let incomeVsExpensesChart = null;
let goalCharts = {};

function getChartColors() {
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    return isDarkMode
        ? { gridColor: 'rgba(255,255,255,0.15)', labelColor: '#b0b0c0', lineColor: 'rgba(75,192,192,1)', fillColor: 'rgba(75,192,192,0.3)' }
        : { gridColor: 'rgba(0,0,0,0.1)', labelColor: '#555', lineColor: 'rgba(75,192,192,1)', fillColor: 'rgba(75,192,192,0.2)' };
}

// --- BIỂU ĐỒ 1: BALANCE TRENDS ---
function renderBalanceTrends(balanceTrends, dashboardData) {
    const lineCtx = document.getElementById('balanceTrendChart');
    if (!lineCtx) return;

    // ✅ CÂP NHẬT CARD HEADER (Số tiền + % thay đổi)
    const balanceValueEl = document.querySelector('.card-body h3.card-value');
    const balanceChangeTextEl = document.querySelector('.card-body .card-change.small');

    if (balanceValueEl && dashboardData) {
        balanceValueEl.textContent = `${dashboardData.totalBalance.toLocaleString()}đ`;
    }

    if (balanceChangeTextEl && dashboardData) {
        if (dashboardData.isNewUser) {
            balanceChangeTextEl.className = 'card-change text-muted small mb-3';
            balanceChangeTextEl.innerHTML = 'Chào mừng bạn bắt đầu!';
        } else {
            const icon = dashboardData.balanceChangePercent >= 0 ? 'up' : 'down';
            const color = dashboardData.balanceChangePercent >= 0 ? 'text-success' : 'text-danger';
            balanceChangeTextEl.className = `card-change ${color} small mb-3`;
            balanceChangeTextEl.innerHTML = `
                <i class="fa-solid fa-arrow-trend-${icon} me-1"></i>
                <span>${Math.abs(dashboardData.balanceChangePercent).toFixed(2)}%</span> Last Month
            `;
        }
    }

    const colors = getChartColors();
    const labels = balanceTrends.map(item => item.date);
    const data = balanceTrends.map(item => item.balance);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Số dư',
            data: data,
            fill: true,
            borderColor: colors.lineColor,
            backgroundColor: colors.fillColor,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: colors.lineColor
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: colors.gridColor },
                ticks: {
                    color: colors.labelColor,
                    callback: function (value) {
                        return (value / 1000000).toFixed(1) + 'M';
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: colors.labelColor }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return 'Số dư: ' + context.parsed.y.toLocaleString() + 'đ';
                    }
                }
            }
        }
    };

    if (balanceTrendChart) {
        balanceTrendChart.destroy();
    }

    balanceTrendChart = new Chart(lineCtx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// --- BIỂU ĐỒ 2: INCOME VS EXPENSES (GIỮ NGUYÊN) ---
function renderIncomeVsExpensesChart(incomeVsExpenses) {
    const barCtx = document.getElementById('incomeVsExpensesChart');
    if (!barCtx) return;

    const colors = getChartColors();

    const labels = incomeVsExpenses.map(item => item.label);
    const incomeData = incomeVsExpenses.map(item => item.income / 1000000);
    const expenseData = incomeVsExpenses.map(item => item.expense / 1000000);

    const incomeColor = '#2F2CD8';
    const expenseColor = '#A0A0FF';

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Thu Nhập',
                data: incomeData,
                backgroundColor: incomeColor,
                borderRadius: 4,
                barThickness: 20
            },
            {
                label: 'Chi Tiêu',
                data: expenseData,
                backgroundColor: expenseColor,
                borderRadius: 4,
                barThickness: 20
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: colors.gridColor },
                ticks: {
                    color: colors.labelColor,
                    callback: function (value) {
                        return value.toFixed(1) + 'M';
                    }
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: colors.labelColor }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: colors.labelColor, usePointStyle: true, padding: 15 }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return context.dataset.label + ': ' +
                            (context.parsed.y * 1000000).toLocaleString() + 'đ';
                    }
                }
            }
        }
    };

    if (incomeVsExpensesChart) {
        incomeVsExpensesChart.destroy();
    }

    incomeVsExpensesChart = new Chart(barCtx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

// --- BIỂU ĐỒ 3: SAVING GOALS (GIỮ NGUYÊN) ---
function createSingleGoalChart(canvasId, percentage) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (goalCharts[canvasId]) {
        goalCharts[canvasId].destroy();
    }

    const colors = getChartColors();
    const trackColor = colors.gridColor;
    const progressColor = '#2F2CD8';

    const data = {
        datasets: [{
            data: [percentage, 100 - percentage],
            backgroundColor: [progressColor, trackColor],
            borderColor: 'transparent',
            borderRadius: 5,
            cutout: '80%'
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        }
    };

    goalCharts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });
}

function createOrUpdateGoalCharts() {
    createSingleGoalChart('goalChartVacation', 80);
    createSingleGoalChart('goalChartGift', 20);
    createSingleGoalChart('goalChartCar', 80);
    createSingleGoalChart('goalChartLaptop', 80);
}

// =====================================
// ✅ KHỞI ĐỘNG
// =====================================

document.addEventListener('DOMContentLoaded', function () {
    // Load lần đầu: Income 1 năm (Balance luôn 7 ngày)
    loadDashboardData(7);

    // ✅ CHỈ CÓ 1 DROPDOWN cho Income vs Expenses
    const incomeFilter = document.getElementById('incomePeriodFilter');
    if (incomeFilter) {
        incomeFilter.addEventListener('change', function () {
            const incomeDays = parseInt(this.value);
            loadDashboardData(incomeDays);  
        });
    }
});

document.addEventListener('theme:updated', function () {
    const incomeDays = parseInt(document.getElementById('incomePeriodFilter')?.value || 365);
    loadDashboardData(incomeDays);
});