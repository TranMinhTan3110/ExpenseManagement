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


const pie = document.getElementById('categoryPieChart')
const categoryLabels = ['Ăn sáng', 'Mua sắm', 'Thời Trang', 'Đi lại'];
const categoryData = [500000, 200000, 300000, 150000];
new Chart(pie, {
    type: 'pie',
    data: {
        labels: categoryLabels,
        datasets: [
            {
                label: 'Chi tiêu',
                data: categoryData,
                backgroundColor: [ // Mảng các màu cho từng miếng bánh
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    // Thêm màu khác nếu có nhiều danh mục hơn
                ],

            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,         // Hiển thị legend hay không
                position: 'right',       // Vị trí: 'top', 'bottom', 'left', 'right'
                align: 'center',       // Căn giữa, trái, phải
                labels: {
                    color: '#333',       // Màu chữ
                    font: {
                        size: 14,          // Cỡ chữ
                        weight: 'bold'     // Độ đậm
                    },
                    padding: 10,         // Khoảng cách giữa các mục
                    boxWidth: 20,        // Kích thước ô màu
                    usePointStyle: false // Dùng hình tròn thay vì hình vuông
                }
            },

            animation: {
                animateRotate: true,   // Xoay biểu đồ khi xuất hiện
                animateScale: true     // Phóng to từ tâm ra
            }

        }
    }

})