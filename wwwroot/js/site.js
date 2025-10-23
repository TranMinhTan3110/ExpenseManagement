// Cập nhật màu legend khi toggle
function updateChartLegend() {
    const newColor = getLegendColor();
    myChart.options.plugins.legend.labels.color = newColor;
    myChart.update();
}

// Toggle dark mode
const toggle = document.querySelector('.dark-light-toggle');
const dark = document.querySelector('.light');

toggle.addEventListener('click', function () {
    document.documentElement.classList.toggle('dark-mode');

    dark.classList.toggle('dark');

    // Đợi DOM cập nhật xong rồi mới gọi cập nhật biểu đồ
    setTimeout(() => {
        updateChartLegend();
    }, 50); // delay nhẹ để đảm bảo class đã gán xong
});

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".input-group");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // chặn reload
        const query = form.querySelector("input[type='search']").value;
        console.log("Tìm kiếm:", query);
    });
});
