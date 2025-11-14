// --- LOAD DỮ LIỆU DASHBOARD ---
let currentBudgetIndex = 0;
let budgetsData = [];
let budgetRotationInterval = null;
async function loadDashboardData(incomeDays = 7) {
    try {
        const [overviewResponse, incomeResponse] = await Promise.all([
            fetch(`/api/dashboard?days=7`),
            fetch(`/api/dashboard?days=${incomeDays}`)
        ]);

        if (!overviewResponse.ok || !incomeResponse.ok) {
            throw new Error('Không tải được dữ liệu');
        }

        const overviewData = await overviewResponse.json();
        const incomeData = await incomeResponse.json();

        render3TopCards(overviewData);
        renderExpenseBreakdown(overviewData.expenseBreakdown);
        renderRecentTransactions(overviewData.recentTransactions);
        renderBalanceTrends(overviewData.balanceTrends, overviewData);
        renderIncomeVsExpensesChart(incomeData.incomeVsExpenses);
        renderSavingGoal(overviewData.savingGoals);
        renderBudgets(overviewData.isNewUser); 
        budgetsData = overviewData.budgets || [];
        startBudgetRotation();

    } catch (error) {
        console.error('Lỗi load dashboard:', error);
    }
}
function startBudgetRotation() {
    // Dừng interval cũ nếu có
    if (budgetRotationInterval) {
        clearInterval(budgetRotationInterval);
    }

    // Hiển thị budget đầu tiên ngay lập tức
    renderBudgetCard();

    // Nếu không có budget hoặc chỉ có 1 budget thì không cần xoay vòng
    if (budgetsData.length <= 1) {
        return;
    }

    // Xoay vòng mỗi 5 giây
    budgetRotationInterval = setInterval(() => {
        currentBudgetIndex = (currentBudgetIndex + 1) % budgetsData.length;
        renderBudgetCard();
    }, 5000);
}
// function render ô ngân sách 
function renderBudgetCard() {
    const titleEl = document.getElementById('budgetCardTitle');
    const valueEl = document.getElementById('budgetCardValue');
    const progressEl = document.getElementById('budgetCardProgress');
    const percentageEl = document.getElementById('budgetCardPercentage');

    if (!titleEl || !valueEl || !progressEl || !percentageEl) {
        return;
    }

    // Nếu không có budget
    if (!budgetsData || budgetsData.length === 0) {
        titleEl.textContent = 'Ngân Sách';
        valueEl.textContent = 'Chưa có ngân sách';
        progressEl.style.width = '0%';
        progressEl.style.backgroundColor = '#ccc';
        percentageEl.textContent = 'Tạo ngân sách để theo dõi!';
        return;
    }

    // Lấy budget hiện tại
    const budget = budgetsData[currentBudgetIndex];

    // Cập nhật nội dung
    titleEl.textContent = `Ngân Sách "${budget.categoryName}"`;
    valueEl.textContent = `${budget.spentAmount.toLocaleString()}đ / ${budget.budgetAmount.toLocaleString()}đ`;

    // Cập nhật progress bar
    progressEl.style.width = `${budget.percentage}%`;
    progressEl.style.backgroundColor = budget.categoryColor;

    // Cập nhật text phần trăm
    if (budget.percentage > 100) {
        percentageEl.textContent = `Đã vượt mức ngân sách`;
    } else {
        percentageEl.textContent = `Đã dùng ${budget.percentage}%`;
    }
    

    // Đổi màu text dựa trên phần trăm
    if (budget.percentage >= 90) {
        percentageEl.className = 'card-change text-danger text-center mt-2 mb-0';
    } else if (budget.percentage >= 70) {
        percentageEl.className = 'card-change text-warning text-center mt-2 mb-0';
    } else {
        percentageEl.className = 'card-change text-muted text-center mt-2 mb-0';
    }
}
window.addEventListener('beforeunload', () => {
    if (budgetRotationInterval) {
        clearInterval(budgetRotationInterval);
    }
});
// --- RENDER 3 Ô TRÊN ---
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

// ✅ FIX: RENDER EXPENSE BREAKDOWN với empty state
function renderExpenseBreakdown(breakdown) {
    const progressBar = document.querySelector('.multi-color-progress');
    const listContainer = document.querySelector('.expense-breakdown-list');

    if (!progressBar || !listContainer) return;

    progressBar.innerHTML = '';
    listContainer.innerHTML = '';

    if (!breakdown || breakdown.length === 0) {
        // ✅ EMPTY STATE
        progressBar.innerHTML = '<div class="progress-bar bg-secondary" style="width: 100%;"></div>';
        listContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fa-solid fa-inbox fa-2x text-muted mb-2"></i>
                <p class="text-muted mb-0">Chưa có chi tiêu trong tháng này</p>
                <small class="text-muted">Hãy thêm giao dịch đầu tiên!</small>
            </div>
        `;
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

// ✅ FIX: RENDER BUDGETS với logic check empty
async function renderBudgets(isNewUser) {
    const budgetList = document.getElementById("budgetList");
    if (!budgetList) return;

    try {
        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) return;

        const response = await fetch(`/api/BudgetApi/user/${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const budgets = await response.json();
        window.cachedBudgets = budgets;

        if (!budgets || budgets.length === 0) {
            // ✅ EMPTY STATE
            budgetList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fa-solid fa-wallet fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0">Chưa có ngân sách nào</p>
                    <small class="text-muted">Tạo ngân sách để quản lý chi tiêu tốt hơn!</small>
                </div>
            `;
            return;
        }

        budgetList.innerHTML = "";

        budgets.forEach(budget => {
            const percent = budget.percentage;
            const item = `
                <div class="budget-item">
                    <div class="budget-icon" style="color: ${budget.categoryColor};">
                        <i class="${budget.categoryIcon}"></i>
                    </div>
                    <div class="budget-details">
                        <div class="budget-info">
                            <span class="budget-name">${budget.categoryName}</span>
                            <span class="budget-amount">${budget.spentAmount.toFixed(2)}đ / ${budget.budgetAmount.toFixed(2)}đ</span>
                        </div>
                        <div class="progress budget-progress" style="height: 6px;">
                            <div class="progress-bar" role="progressbar" 
                                 style="width: ${percent}%; background-color: ${budget.categoryColor};">
                            </div>
                        </div>
                    </div>
                </div>
            `;
            budgetList.insertAdjacentHTML("beforeend", item);
        });

    } catch (error) {
        console.error("Error loading budgets:", error);
    }
}

// ✅ FIX: RENDER RECENT TRANSACTIONS
function renderRecentTransactions(transactions) {
    const tbody = document.querySelector('.transaction-history tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <i class="fa-solid fa-receipt fa-2x text-muted mb-2 d-block"></i>
                    <p class="text-muted mb-0">Chưa có giao dịch nào</p>
                    <small class="text-muted">Giao dịch của bạn sẽ hiển thị tại đây</small>
                </td>
            </tr>
        `;
        return;
    }

    transactions.forEach(tx => {
        const date = new Date(tx.transactionDate);
        const formattedDate = date.toLocaleDateString('vi-VN');
        const amountClass = tx.type === 'Income' ? 'text-success' : 'text-danger';
        const amountSign = tx.type === 'Income' ? '+' : '-';

        tbody.innerHTML += `
            <tr>
                <td>
                    <span class="transaction-icon">
                        <i class="${tx.iconClass}" style="color:${tx.colorHex}"></i>
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

// BIỂU ĐỒ
let balanceTrendChart = null;
let incomeVsExpensesChart = null;
let goalCharts = {};

function getChartColors() {
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    return isDarkMode
        ? { gridColor: 'rgba(255,255,255,0.15)', labelColor: '#b0b0c0', lineColor: 'rgba(75,192,192,1)', fillColor: 'rgba(75,192,192,0.3)' }
        : { gridColor: 'rgba(0,0,0,0.1)', labelColor: '#555', lineColor: 'rgba(75,192,192,1)', fillColor: 'rgba(75,192,192,0.2)' };
}

// ✅ FIX: BALANCE TRENDS - Không cho phép giá trị âm
// --- BIỂU ĐỒ 1: BALANCE TRENDS ---
function renderBalanceTrends(balanceTrends, dashboardData) {
    const lineCtx = document.getElementById('balanceTrendChart');
    if (!lineCtx) return;

    //  CÂP NHẬT CARD HEADER (Số tiền + % thay đổi)
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


// BIỂU ĐỒ 2: INCOME VS EXPENSES
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

// ✅ FIX: SAVING GOALS với empty state
function renderSavingGoal(goals) {
    const container = document.getElementById('savingGoalsContainer');
    if (!container) return;

    if (!goals || goals.length === 0) {
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fa-solid fa-bullseye fa-2x text-muted mb-2 d-block"></i>
                <p class="text-muted mb-0">Chưa có mục tiêu tiết kiệm</p>
                <small class="text-muted d-block">Đặt mục tiêu để theo dõi tiến độ!</small>
            </div>
        `;
        return;
    }

    // Reset về grid layout khi có data
    container.style.display = '';
    container.style.justifyContent = '';
    container.style.alignItems = '';

    let htmlContent = '';
    goals.forEach((goal, index) => {
        const canvasId = `goalChart${index}`;
        htmlContent += `
            <div class="goal-item">
                <div class="goal-chart-container">
                    <canvas id="${canvasId}" width="75" height="75"></canvas>
                    <div class="goal-percentage">${goal.progressPercentage}%</div>
                </div>
                <span class="goal-label">${goal.goalName}</span>
            </div>
        `;
    });
    container.innerHTML = htmlContent;

    goals.forEach((goal, index) => {
        const canvasId = `goalChart${index}`;
        createSingleGoalChart(canvasId, goal.progressPercentage);
    });
}

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

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardData(7);

    const incomeFilter = document.getElementById('incomePeriodFilter');
    if (incomeFilter) {
        incomeFilter.addEventListener('change', function () {
            const incomeDays = parseInt(this.value);
            loadDashboardData(incomeDays);
        });
    }
});

document.addEventListener('theme:updated', function () {
    const incomeDays = parseInt(document.getElementById('incomePeriodFilter')?.value || 7);
    loadDashboardData(incomeDays);
});