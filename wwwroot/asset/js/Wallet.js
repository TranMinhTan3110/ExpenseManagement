// XÓA TOÀN BỘ CODE CŨ VÀ THAY BẰNG CODE NÀY

var myChart = null; // Biến global để lưu biểu đồ

// Hàm lấy màu (giữ nguyên)
function getLegendColor() {
    return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color').trim() || '#333';
}

// --- HÀM MỚI: Nhận dữ liệu từ API và vẽ Pie Chart ---
// --- HÀM MỚI: Nhận dữ liệu từ API và vẽ Pie Chart ---
function renderPieChart(expenseBreakdown) {
    const pie = document.getElementById('categoryPieChart');
    if (!pie) return;

    // 1. Nếu không có dữ liệu → Hiển thị "Chưa có chi tiêu"
    if (!expenseBreakdown || expenseBreakdown.length === 0) {
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        // VẼ TEXT ĐẸPHƠN (CĂN GIỮA + MÀU XÁM NHẸ)
        const ctx = pie.getContext('2d');
        const parentWidth = pie.parentElement.offsetWidth;
        const parentHeight = pie.parentElement.offsetHeight;

        pie.width = parentWidth;
        pie.height = parentHeight;

        ctx.clearRect(0, 0, pie.width, pie.height);

        // Vẽ icon và text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Icon (emoji hoặc symbol)
        ctx.font = '48px Arial';
        ctx.fillStyle = '#d1d5db'; // Màu xám nhạt
        ctx.fillText('📊', pie.width / 2, pie.height / 2 - 30);

        // Text chính
        ctx.font = '16px Arial';
        ctx.fillStyle = '#9ca3af'; // Màu xám vừa
        ctx.fillText('Chưa có chi tiêu trong tháng này', pie.width / 2, pie.height / 2 + 20);

        return;
    }

    // 2. Chuẩn bị dữ liệu từ API
    const labels = expenseBreakdown.map(item => item.categoryName);
    const data = expenseBreakdown.map(item => item.amount);
    const colors = expenseBreakdown.map(item => item.colorHex || '#808080');

    // 3. Nếu biểu đồ cũ tồn tại → Xóa đi
    if (myChart) {
        myChart.destroy();
    }

    // 4. Vẽ biểu đồ mới
    myChart = new Chart(pie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Chi tiêu',
                data: data,
                backgroundColor: colors.map(c => c + 'B3'), // Thêm độ trong suốt (70%)
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    align: 'center',
                    labels: {
                        color: function () {
                            return getLegendColor();
                        },
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 10,
                        boxWidth: 20,
                        usePointStyle: false
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            let value = context.parsed || 0;
                            let total = context.dataset.data.reduce((a, b) => a + b, 0);
                            let percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString()}đ (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

// --- CODE WALLET CLICK (Giữ nguyên) ---
var walletList = document.querySelectorAll(".wallet-list__item");
walletList.forEach(wallet => {
    wallet.addEventListener('click', (e) => {
        e.preventDefault();
        var currentWallet = document.querySelector(".wallet-list__item--active");
        if (currentWallet) {
            currentWallet.classList.remove('wallet-list__item--active');
        }
        e.currentTarget.classList.add('wallet-list__item--active');
    });
});