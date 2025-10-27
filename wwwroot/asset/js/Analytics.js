function initDonutChart(canvasId, data, labels) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // ✅ Không có canvas thì bỏ qua

    // Nếu chart cũ tồn tại thì hủy
    const existingChart = Chart.getChart(canvas);
    if (existingChart) existingChart.destroy();

    new Chart(canvas, {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: data,
                    backgroundColor: [
                        "rgba(22, 82, 240,1)",
                        "rgba(22, 82, 240,0.5)",
                        "rgba(22, 82, 240,0.15)",
                    ],
                },
            ],
            labels: labels,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "80%",
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
        },
    });
}

// ✅ Gọi đúng chart theo trang
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("chartjsIncome")) {
        initDonutChart("chartjsIncome", [33, 33, 33], ["Facebook", "Youtube", "Google"]);
    }

    if (document.getElementById("chartjsExpense")) {
        initDonutChart("chartjsExpense", [40, 30, 30], ["Rent", "Bills", "Others"]);
    }
});
