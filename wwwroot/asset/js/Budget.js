document.addEventListener("DOMContentLoaded", function () {
    const chartIds = [
        "chartjsBudgetPeriod",
        "chartjsBudgetPeriod2",
        "chartjsBudgetPeriod3",
        "chartjsBudgetPeriod4",
    ];

    const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
            label: "Expenses",
            data: [120, 190, 75, 150, 220, 180, 90],
            backgroundColor: "#2F2CD8",
            borderRadius: 6
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#2F2CD8",
                titleColor: "#fff",
                bodyColor: "#fff",
                cornerRadius: 6
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#0c0b5d", font: { size: 12 } }
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(145, 158, 171, 0.2)" },
                ticks: { color: "#6c757d", font: { size: 12 } }
            }
        }
    };

    chartIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            new Chart(el, { type: 'bar', data, options });
        }
    });
});
