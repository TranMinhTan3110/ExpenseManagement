// --- Biến toàn cục cho các biểu đồ ---
let balanceTrendChart = null;
let incomeVsExpensesChart = null;

// --- Hàm helper để lấy màu từ CSS (Dùng cho cả 2 biểu đồ) ---
function getCssVariable(variable) {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * =================================================================
 * BIỂU ĐỒ 1: XU HƯỚNG SỐ DƯ (BALANCE TRENDS)
 * =================================================================
 */
function createOrUpdateBalanceChart() {
    const lineCtx = document.getElementById('balanceTrendChart');
    if (!lineCtx) return;

    // Lấy màu từ CSS
    const chartGridColor = getCssVariable('--chart-grid-color');
    const chartLabelColor = getCssVariable('--chart-label-color');
    const chartLineColor = getCssVariable('--chart-line-color');
    const chartFillColor = getCssVariable('--chart-fill-color');

    // (SAU NÀY NỐI BACKEND): Bạn sẽ fetch data và gán vào đây
    const trendLabels = ['4 Jan', '5 Jan', '6 Jan', '7 Jan', '8 Jan', '9 Jan', '10 Jan'];
    const trendData = [50, 60, 45, 100, 80, 150, 130];

    const chartData = {
        labels: trendLabels,
        datasets: [{
            label: 'Số dư',
            data: trendData,
            fill: true,
            borderColor: chartLineColor,
            backgroundColor: chartFillColor,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: chartGridColor },
                ticks: { color: chartLabelColor }
            },
            x: {
                grid: { display: false },
                ticks: { color: chartLabelColor }
            }
        },
        plugins: {
            legend: { display: false }
        }
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
 * BIỂU ĐỒ 2: THU NHẬP VS CHI TIÊU
 * =================================================================
 */
function createOrUpdateIncomeVsExpensesChart() {
    const barCtx = document.getElementById('incomeVsExpensesChart');
    if (!barCtx) return; // Thoát nếu không ở trang có biểu đồ này

    // Lấy màu từ CSS
    const chartGridColor = getCssVariable('--chart-grid-color');
    const chartLabelColor = getCssVariable('--chart-label-color');

    // (SAU NÀY NỐI BACKEND): Bạn sẽ fetch data và gán vào 3 biến này
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const incomeData = [5.0, 6.0, 4.5, 5.5, 3.0, 6.0, 4.5, 6.0, 8.0, 3.0]; // Dữ liệu Thu nhập (ví dụ: triệu đồng)
    const expenseData = [4.0, 5.0, 3.5, 4.5, 2.0, 5.0, 3.5, 5.0, 7.0, 2.0]; // Dữ liệu Chi tiêu

    // Bạn có thể lấy màu cột từ CSS hoặc định nghĩa ở đây
    const incomeColor = '#2F2CD8'; // Màu xanh (hoặc var(--primary-color))
    const expenseColor = '#A0A0FF'; // Màu xanh nhạt

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
            y: {
                beginAtZero: true,
                grid: { color: chartGridColor },
                ticks: { color: chartLabelColor }
            },
            x: {
                grid: { display: false },
                ticks: { color: chartLabelColor }
            }
        },
        plugins: {
            legend: {
                display: true, // Hiển thị chú thích (Thu nhập / Chi tiêu)
                position: 'top',
                labels: {
                    color: chartLabelColor // Màu chữ của chú thích
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
            type: 'bar', // Loại biểu đồ là 'bar'
            data: chartData,
            options: chartOptions
        });
    }
}


// --- HÀM CHẠY KHI TẢI TRANG ---
document.addEventListener('DOMContentLoaded', function () {
    // 1. Vẽ 2 biểu đồ
    createOrUpdateBalanceChart();
    createOrUpdateIncomeVsExpensesChart();



// --- HÀM LẮNG NGHE SỰ KIỆN DARK MODE ---
document.addEventListener('theme:updated', function () {
    // Vẽ lại CẢ 2 BIỂU ĐỒ khi đổi theme
    createOrUpdateBalanceChart();
    createOrUpdateIncomeVsExpensesChart();
});