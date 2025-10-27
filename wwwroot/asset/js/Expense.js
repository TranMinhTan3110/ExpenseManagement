window.addEventListener("load", () => {
    const canvas = document.getElementById("chartjsExpense");
    if (!canvas) return;

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();

    new Chart(canvas, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [45, 30, 25],
                backgroundColor: [
                    "rgba(239, 68, 68,1)",
                    "rgba(239, 68, 68,0.5)",
                    "rgba(239, 68, 68,0.15)",
                ],
            }],
            labels: ["Rent", "Bills", "Others"],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "80%",
            plugins: {
                legend: { display: true, position: "top" },
            },
        },
    });
});
