// XÓA TOÀN BỘ CODE CŨ VÀ THAY BẰNG CODE NÀY

var myChart = null; // Biến global để lưu biểu đồ
let currentPage = 1; // Trang hiện tại
const itemsPerPage = 7; // Số giao dịch mỗi trang
let allTransactions = []; // Lưu toàn bộ giao dịch

// Hàm lấy màu (giữ nguyên)
function getLegendColor() {
    return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color').trim() || '#333';
}

// --- HÀM VẼ PIE CHART (giữ nguyên) ---
function renderPieChart(expenseBreakdown) {
    const pie = document.getElementById('categoryPieChart');
    if (!pie) return;

    if (!expenseBreakdown || expenseBreakdown.length === 0) {
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        const ctx = pie.getContext('2d');
        const parentWidth = pie.parentElement.offsetWidth;
        const parentHeight = pie.parentElement.offsetHeight;

        pie.width = parentWidth;
        pie.height = parentHeight;

        ctx.clearRect(0, 0, pie.width, pie.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '48px Arial';
        ctx.fillStyle = '#d1d5db';
        ctx.fillText('📊', pie.width / 2, pie.height / 2 - 30);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Chưa có chi tiêu trong tháng này', pie.width / 2, pie.height / 2 + 20);

        return;
    }

    const labels = expenseBreakdown.map(item => item.categoryName);
    const data = expenseBreakdown.map(item => item.amount);
    const colors = expenseBreakdown.map(item => item.colorHex || '#808080');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(pie, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Chi tiêu',
                data: data,
                backgroundColor: colors.map(c => c + 'B3'),
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

// --- HÀM MỚI: RENDER BẢNG GIAO DỊCH VỚI PHÂN TRANG ---
function renderTransactionHistory(history) {
    allTransactions = history || [];
    currentPage = 1;
    renderPage();
}

function renderPage() {
    const transactionHistoryBody = document.querySelector(".transaction-history tbody");
    if (!transactionHistoryBody) return;

    transactionHistoryBody.innerHTML = '';

    if (allTransactions.length === 0) {
        transactionHistoryBody.innerHTML = '<tr><td colspan="4" class="text-center">Chưa có giao dịch nào.</td></tr>';
        renderPagination(0);
        return;
    }

    // Tính toán phân trang
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = allTransactions.slice(startIndex, endIndex);

    // Hiển thị giao dịch của trang hiện tại
    currentTransactions.forEach(tx => {
        const tr = document.createElement('tr');

        const date = new Date(tx.transactionDate);
        const formattedDate = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const amountClass = tx.type === 'Income' ? 'text-success' : 'text-danger';
        const amountSign = tx.type === 'Income' ? '+' : '-';

        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <i class="${tx.category?.icon?.iconClass || 'fa-solid fa-circle-question'}"
                       style="color: ${tx.category?.color?.hexCode || '#808080'};  margin-right: 10px;"></i>
                    <span>${tx.category?.categoryName || 'Chưa phân loại'}</span>
                </div>
            </td>
            <td>${formattedDate}</td>
            <td>${tx.description || '-'}</td>
            <td class="text-end ${amountClass}">
                <strong>${amountSign}${tx.amount.toLocaleString()}đ</strong>
            </td>
        `;

        transactionHistoryBody.appendChild(tr);
    });

    // Render phân trang
    renderPagination(allTransactions.length);
}

// --- HÀM MỚI: RENDER PHÂN TRANG ---
function renderPagination(totalItems) {
    let paginationContainer = document.querySelector('.pagination-container');

    // Tạo container nếu chưa có
    if (!paginationContainer) {
        const cardBody = document.querySelector('.transaction-history');
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container d-flex justify-content-between align-items-center mt-3';
        cardBody.appendChild(paginationContainer);
    }

    paginationContainer.innerHTML = '';

    if (totalItems === 0) return;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Hiển thị thông tin
    const info = document.createElement('div');
    info.className = 'pagination-info';
    info.innerHTML = `Hiển thị ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} / ${totalItems}`;
    paginationContainer.appendChild(info);

    // Tạo các nút phân trang
    const paginationButtons = document.createElement('div');
    paginationButtons.className = 'pagination-buttons';

    // Nút Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn btn-sm btn-outline-primary me-2 ${currentPage === 1 ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="fi fi-rr-angle-left"></i>';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPage();
        }
    };
    paginationButtons.appendChild(prevBtn);

    // Các nút trang
    for (let i = 1; i <= totalPages; i++) {
        // Chỉ hiển thị 5 nút xung quanh trang hiện tại
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn btn-sm me-1 ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderPage();
            };
            paginationButtons.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            // Thêm dấu ... nếu cần
            const dots = document.createElement('span');
            dots.className = 'me-1';
            dots.textContent = '...';
            paginationButtons.appendChild(dots);
        }
    }

    // Nút Next
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn btn-sm btn-outline-primary ms-1 ${currentPage === totalPages ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="fi fi-rr-angle-right"></i>';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderPage();
        }
    };
    paginationButtons.appendChild(nextBtn);

    paginationContainer.appendChild(paginationButtons);
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

// Export hàm để sử dụng từ HTML
window.renderTransactionHistory = renderTransactionHistory;
window.renderPieChart = renderPieChart;