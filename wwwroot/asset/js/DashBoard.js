// --- Biến toàn cục cho các biểu đồ ---
let balanceTrendChart = null;
let incomeVsExpensesChart = null;
let goalCharts = {}; // Biến lưu 4 biểu đồ tròn

/**
 * =================================================================
 * HÀM LẤY MÀU (TỰ KIỂM TRA DARK MODE)
 * =================================================================
 */
function getChartColors() {
    // Tự kiểm tra xem <html> có class 'dark-mode' không
    const isDarkMode = document.documentElement.classList.contains('dark-mode');

    if (isDarkMode) {
        // Trả về màu SÁNG cho Dark Mode
        return {
            gridColor: 'rgba(255, 255, 255, 0.15)',
            labelColor: '#b0b0c0', // Màu chữ sáng
            lineColor: 'rgba(75, 192, 192, 1)',
            fillColor: 'rgba(75, 192, 192, 0.3)'
        };
    } else {
        // Trả về màu TỐI cho Light Mode
        return {
            gridColor: 'rgba(0, 0, 0, 0.1)',
            labelColor: '#555', // Màu chữ tối
            lineColor: 'rgba(75, 192, 192, 1)',
            fillColor: 'rgba(75, 192, 192, 0.2)'
        };
    }
}

/**
 * =================================================================
 * BIỂU ĐỒ 1: XU HƯỚNG SỐ DƯ (BALANCE TRENDS)
 * (Hàm này vẫn ở đây phòng khi bạn muốn thêm lại)
 * =================================================================
 */
function createOrUpdateBalanceChart() {
    const lineCtx = document.getElementById('balanceTrendChart');
    if (!lineCtx) return; // Không tìm thấy canvas, thoát ra

    const colors = getChartColors();
    const trendLabels = ['4 Jan', '5 Jan', '6 Jan', '7 Jan', '8 Jan', '9 Jan', '10 Jan'];
    const trendData = [50, 60, 45, 100, 80, 150, 130];

    const chartData = {
        labels: trendLabels,
        datasets: [{
            label: 'Số dư',
            data: trendData,
            fill: true,
            borderColor: colors.lineColor,
            backgroundColor: colors.fillColor,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, grid: { color: colors.gridColor }, ticks: { color: colors.labelColor } },
            x: { grid: { display: false }, ticks: { color: colors.labelColor } }
        },
        plugins: { legend: { display: false } }
    };

    if (balanceTrendChart) {
        balanceTrendChart.data = chartData;
        balanceTrendChart.options = chartOptions;
        balanceTrendChart.update();
    } else {
        balanceTrendChart = new Chart(lineCtx, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * =================================================================
 * BIỂU ĐỒ 2: THU NHẬP VS CHI TIÊU (BAR CHART) - (ĐÃ SỬA LỖI)
 * =================================================================
 */
function createOrUpdateIncomeVsExpensesChart() {
    const barCtx = document.getElementById('incomeVsExpensesChart');
    if (!barCtx) return; // Không tìm thấy canvas, thoát ra

    const colors = getChartColors();

    // Chỉ dùng code cứng, không gọi async/await
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const incomeData = [5.0, 6.0, 4.5, 5.5, 3.0, 6.0, 4.5, 6.0, 8.0, 3.0];
    const expenseData = [4.0, 5.0, 3.5, 4.5, 2.0, 5.0, 3.5, 5.0, 7.0, 2.0];

    const incomeColor = '#2F2CD8';
    const expenseColor = '#A0A0FF';

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Thu Nhập (Income)',
                data: incomeData,
                backgroundColor: incomeColor,
                borderRadius: 4
            },
            {
                label: 'Chi Tiêu (Expenses)',
                data: expenseData,
                backgroundColor: expenseColor,
                borderRadius: 4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true, grid: { color: colors.gridColor }, ticks: { color: colors.labelColor } },
            x: { grid: { display: false }, ticks: { color: colors.labelColor } }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: colors.labelColor
                }
            }
        }
    };

    if (incomeVsExpensesChart) {
        incomeVsExpensesChart.data = chartData;
        incomeVsExpensesChart.options = chartOptions;
        incomeVsExpensesChart.update();
    } else {
        incomeVsExpensesChart = new Chart(barCtx, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }
}

/**
 * =================================================================
 * BIỂU ĐỒ 3: MỤC TIÊU TIẾT KIỆM (DOUGHNUT)
 * =================================================================
 */
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
        },
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


// --- HÀM CHẠY KHI TẢI TRANG ---
document.addEventListener('DOMContentLoaded', function () {
    createOrUpdateBalanceChart();        // (Sẽ tự bỏ qua nếu không tìm thấy HTML)
    createOrUpdateIncomeVsExpensesChart(); // (Sẽ vẽ biểu đồ Income/Expense)
    createOrUpdateGoalCharts();          // (Sẽ vẽ 4 biểu đồ tròn)
});


// --- HÀM LẮNG NGHE SỰ KIỆN DARK MODE ---
document.addEventListener('theme:updated', function () {
    createOrUpdateBalanceChart();
    createOrUpdateIncomeVsExpensesChart();
    createOrUpdateGoalCharts();
});