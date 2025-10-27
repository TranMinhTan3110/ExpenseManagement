window.addEventListener("load", () => {
    const canvas = document.getElementById("chartjsIncome");
    if (!canvas) return;

    if (Chart.getChart(canvas)) Chart.getChart(canvas).destroy();

    new Chart(canvas, {
        type: "doughnut",
        data: {
            datasets: [{
                data: [33, 33, 33],
                backgroundColor: [
                    "rgba(22, 82, 240,1)",
                    "rgba(22, 82, 240,0.5)",
                    "rgba(22, 82, 240,0.15)",
                ],
            }],
            labels: ["Facebook", "Youtube", "Google"],
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
