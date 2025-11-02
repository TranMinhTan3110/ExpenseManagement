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

    // =================================================================
    // CODE MỚI CHO ICON VÀ COLOR PICKER
    // =================================================================

    // --- 2. ICON PICKER ---

    // Gọi hàm render từ file Icons.js
    if (typeof renderIconPicker === 'function') {
        renderIconPicker('iconPickerContainer');
    }

    // Lấy các element từ Category.cshtml
    const iconToggle = document.getElementById('iconPickerToggle');
    const iconList = document.getElementById('iconPickerList');
    const iconContainer = document.getElementById('iconPickerContainer');
    const iconPreview = document.getElementById('selectedIconPreview');
    const iconHiddenInput = document.getElementById('selectedIcon');

    // 2a. Bấm để Hiện/Ẩn danh sách icon
    if (iconToggle && iconList) {
        iconToggle.addEventListener('click', () => {
            const colorList = document.getElementById('colorPickerList');
            if (colorList) colorList.style.display = 'none';
            iconList.style.display = iconList.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 2b. Bấm để Chọn một icon
    if (iconContainer && iconPreview && iconHiddenInput) {
        iconContainer.addEventListener('click', function (e) {
            const iconOption = e.target.closest('.icon-option');
            if (!iconOption) return;

            iconContainer.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('active'));
            iconOption.classList.add('active');

            const iconClass = iconOption.dataset.icon.trim();
            iconPreview.innerHTML = `<i class="${iconClass}"></i> ${iconOption.title}`;
            iconPreview.classList.remove('text-muted');
            iconHiddenInput.value = iconClass;
            iconList.style.display = 'none';
        });
    }

    // --- 3. COLOR PICKER ---

    const COLORS = [
        { name: "Purple", class: "bg-purple-500" },
        { name: "Red", class: "bg-red-500" },
        { name: "Orange", class: "bg-orange-500" },
        { name: "Amber", class: "bg-amber-500" },
        { name: "Yellow", class: "bg-yellow-500" },
        { name: "Lime", class: "bg-lime-500" },
        { name: "Green", class: "bg-green-500" },
        { name: "Emerald", class: "bg-emerald-500" },
        { name: "Teal", class: "bg-teal-500" },
        { name: "Cyan", class: "bg-cyan-500" },
        { name: "Sky", class: "bg-sky-500" },
        { name: "Blue", class: "bg-blue-500" },
        { name: "Indigo", class: "bg-indigo-500" },
        { name: "Violet", class: "bg-violet-500" },
        { name: "Fuchsia", class: "bg-fuchsia-500" },
        { name: "Pink", class: "bg-pink-500" },
        { name: "Rose", class: "bg-rose-500" },
    ];

    // 3a. Hàm render các cục màu
    function renderColorPicker(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = COLORS.map(
            (color) => `
          <div class="color-option ${color.class}" 
               data-color-class="${color.class}" 
               data-color-name="${color.name}" 
               title="${color.name}">
          </div>
        `
        ).join("");
    }

    renderColorPicker('colorPickerContainer');

    // Lấy các element
    const colorToggle = document.getElementById('colorPickerToggle');
    const colorList = document.getElementById('colorPickerList');
    const colorContainer = document.getElementById('colorPickerContainer');
    const colorPreview = document.getElementById('selectedColorPreview');
    const colorHiddenInput = document.getElementById('selectedColor');

    // 3b. Bấm để Hiện/Ẩn danh sách màu
    if (colorToggle && colorList) {
        colorToggle.addEventListener('click', () => {
            const iconList = document.getElementById('iconPickerList');
            if (iconList) iconList.style.display = 'none';
            colorList.style.display = colorList.style.display === 'none' ? 'block' : 'none';
        });
    }

    // 3c. Bấm để Chọn một màu
    if (colorContainer && colorPreview && colorHiddenInput) {
        colorContainer.addEventListener('click', function (e) {
            const colorOption = e.target.closest('.color-option');
            if (!colorOption) return;

            colorContainer.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            colorOption.classList.add('active');

            const colorClass = colorOption.dataset.colorClass;
            const colorName = colorOption.dataset.colorName;

            colorPreview.innerHTML = `
                <span class="color-option ${colorClass}" style="width: 20px; height: 20px; border:none;"></span>
                ${colorName}
            `;
            colorPreview.classList.remove('text-muted');
            colorHiddenInput.value = colorClass;
            colorList.style.display = 'none';
        });
    }
});


// --- HÀM LẮNG NGHE SỰ KIỆN DARK MODE ---
document.addEventListener('theme:updated', function () {
    // Vẽ lại CẢ 2 BIỂU ĐỒ khi đổi theme
    createOrUpdateBalanceChart();
    createOrUpdateIncomeVsExpensesChart();
});