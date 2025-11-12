//// Initialize Chart
//const ctx = document.getElementById('userGrowthChart').getContext('2d');

//const gradient = ctx.createLinearGradient(0, 0, 0, 400);
//gradient.addColorStop(0, 'rgba(33, 116, 198, 0.3)');
//gradient.addColorStop(1, 'rgba(33, 116, 198, 0.01)');

//new Chart(ctx, {
//    type: 'line',
//    data: {
//        labels: ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'],
//        datasets: [{
//            label: 'Số lượng Users',
//            data: [850, 920, 1050, 1100, 1180, 1234],
//            borderColor: '#2174c6',
//            backgroundColor: gradient,
//            borderWidth: 3,
//            fill: true,
//            tension: 0.4,
//            pointRadius: 6,
//            pointBackgroundColor: '#2174c6',
//            pointBorderColor: '#fff',
//            pointBorderWidth: 3,
//            pointHoverRadius: 8,
//            pointHoverBackgroundColor: '#2174c6',
//            pointHoverBorderColor: '#fff',
//            pointHoverBorderWidth: 3
//        }]
//    },
//    options: {
//        responsive: true,
//        maintainAspectRatio: true,
//        aspectRatio: 2.5,
//        plugins: {
//            legend: {
//                display: true,
//                position: 'top',
//                align: 'end',
//                labels: {
//                    usePointStyle: true,
//                    padding: 20,
//                    font: {
//                        size: 13,
//                        weight: '500'
//                    }
//                }
//            },
//            tooltip: {
//                backgroundColor: 'rgba(0, 0, 0, 0.8)',
//                padding: 12,
//                titleFont: {
//                    size: 14,
//                    weight: 'bold'
//                },
//                bodyFont: {
//                    size: 13
//                },
//                callbacks: {
//                    label: function (context) {
//                        return ' ' + context.parsed.y.toLocaleString() + ' users';
//                    }
//                }
//            }
//        },
//        scales: {
//            y: {
//                beginAtZero: false,
//                min: 800,
//                grid: {
//                    color: 'rgba(0, 0, 0, 0.05)',
//                    drawBorder: false
//                },
//                ticks: {
//                    padding: 10,
//                    font: {
//                        size: 12
//                    },
//                    callback: function (value) {
//                        return value.toLocaleString();
//                    }
//                }
//            },
//            x: {
//                grid: {
//                    display: false,
//                    drawBorder: false
//                },
//                ticks: {
//                    padding: 10,
//                    font: {
//                        size: 12
//                    }
//                }
//            }
//        },
//        interaction: {
//            intersect: false,
//            mode: 'index'
//        }
//    }
//});
       