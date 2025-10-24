document.addEventListener('DOMContentLoaded', function () {

    // --- PHẦN TOGGLE DARK MODE ---
    const toggle = document.querySelector('.dark-light-toggle');
    const dark = document.querySelector('.light');
    const bodyOrHtml = document.documentElement; // Dùng <html> để gán class

    // Hàm lấy màu (nếu bạn muốn giữ nó ở file chung)
    function getLegendColor() {
        return getComputedStyle(bodyOrHtml)
            .getPropertyValue('--text-color').trim();
    }

    // Sự kiện click nút toggle
    if (toggle) {
        toggle.addEventListener('click', function () {
            bodyOrHtml.classList.toggle('dark-mode');

            // Lưu theme vào localStorage
            const currentMode = bodyOrHtml.classList.contains('dark-mode') ? "dark" : "light";
            localStorage.setItem('theme', currentMode);

            // Đổi icon mặt trời/mặt trăng (giả sử bạn có class .dark để ẩn/hiện)
            if (dark) dark.classList.toggle('dark');

            // Đợi DOM cập nhật xong rồi mới gọi cập nhật biểu đồ
            setTimeout(() => {
                // KIỂM TRA BIẾN GLOBAL myChart (từ file Wallet.js)
                if (typeof myChart !== 'undefined' && myChart) {
                    myChart.update(); // Yêu cầu Chart.js vẽ lại
                }
                // Bạn có thể thêm code update cho các biểu đồ khác ở đây
            }, 50);
        });
    }

    // --- PHẦN NGĂN FORM SUBMIT (GIỮ NGUYÊN) ---
    const searchForm = document.querySelector(".header-search .input-group");
    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault(); // chặn reload
            const query = searchForm.querySelector("input[type='search']").value;
            console.log("Tìm kiếm:", query);
        });
    }

    // --- PHẦN TẢI THEME KHI MỚI VÀO TRANG (GIỮ NGUYÊN) ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        bodyOrHtml.classList.add('dark-mode');
        if (dark) dark.classList.toggle('dark');
    } else {
        bodyOrHtml.classList.remove('dark-mode');
    }

}); // Kết thúc DOMContentLoaded


document.addEventListener('DOMContentLoaded', function () {

    // --- Code ẩn loader khi trang tải xong  ---
    window.addEventListener('load', function () {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    });


    // Code hiển thị loader khi bấm chuyển trang

    const allLinks = document.querySelectorAll('a'); // Tìm tất cả các thẻ <a>
    const loader = document.getElementById('page-loader');

    allLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Chỉ kích hoạt loader cho các link chuyển trang thực sự
            // (Không kích hoạt cho link "#" hoặc link gọi modal)
            if (href && href !== "#" && !href.startsWith('#') && !this.getAttribute('data-bs-toggle')) {
                 e.preventDefault(); 

                // Hiển thị lại màn hình chờ
                if (loader) {
                    loader.classList.remove('hidden');
                }

              //delay
                setTimeout(() => {

                    window.location.href = href;
                 }, 500); 
            }
        });
    });

});