// wallet
var walletList = document.querySelectorAll(".wallet-list__item");

walletList.forEach(wallet => {
    wallet.addEventListener('click', (e) => {
        e.preventDefault();
        var currentWallet = document.querySelector(".wallet-list__item--active")
        if (currentWallet) {
            currentWallet.classList.remove('wallet-list__item--active')
        }
        e.currentTarget.classList.add('wallet-list__item--active')
    })
})

const pie = document.getElementById('categoryPieChart');
const categoryLabels = ['Ăn sáng', 'Mua sắm', 'Thời Trang', 'Đi lại'];
const categoryData = [500000, 200000, 300000, 150000];

function getLegendColor() {
    return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color').trim();
}

const myChart = new Chart(pie, {
    type: 'pie',
    data: {
        labels: categoryLabels,
        datasets: [{
            label: 'Chi tiêu',
            data: categoryData,
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
            ]
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
                    color: getLegendColor(), // lấy màu lúc khởi tạo
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 10,
                    boxWidth: 20,
                    usePointStyle: false
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    }
});