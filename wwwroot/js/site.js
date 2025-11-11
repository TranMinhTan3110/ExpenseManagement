

document.addEventListener('DOMContentLoaded', function () {

    // --- PHẦN TẢI THEME KHI MỚI VÀO TRANG ---
    const bodyOrHtml = document.documentElement;
    const dark = document.querySelector('.light');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        bodyOrHtml.classList.add('dark-mode');
        if (dark) dark.classList.toggle('dark');
    } else {
        bodyOrHtml.classList.remove('dark-mode');
    }

    // --- PHẦN TOGGLE DARK MODE ---
    const toggle = document.querySelector('.dark-light-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            bodyOrHtml.classList.toggle('dark-mode');

            // Lưu theme vào localStorage
            const currentMode = bodyOrHtml.classList.contains('dark-mode') ? "dark" : "light";
            localStorage.setItem('theme', currentMode);

            // Đổi icon mặt trời/mặt trăng
            if (dark) dark.classList.toggle('dark');

            // (Code update biểu đồ của bạn...)
            setTimeout(() => {
                if (typeof myChart !== 'undefined' && myChart) {
                    myChart.update();
                }
            }, 50);
        });
    }

    // --- PHẦN NGĂN FORM SEARCH SUBMIT ---
    //const searchForm = document.querySelector(".header-search .input-group");
    //if (searchForm) {
    //    searchForm.addEventListener("submit", function (e) {
    //        e.preventDefault(); // chặn reload
    //        const query = searchForm.querySelector("input[type='search']").value;
    //        console.log("Tìm kiếm:", query);
    //    });
    //}

    // --- PHẦN XỬ LÝ LOADER (PAGE-LOADER) ---
    const loader = document.getElementById('page-loader');

    // Ẩn loader khi trang tải xong
    window.addEventListener('load', function () {
        if (loader) {
            loader.classList.add('hidden');
        }
    });

    // Hiển thị loader khi bấm link
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const dataBsToggle = this.getAttribute('data-bs-toggle'); // Lấy thuộc tính data-bs-toggle

            // Chỉ kích hoạt loader cho link chuyển trang
            // Bỏ qua link "#", link JS, link modal, VÀ link tooltip
            if (href && href !== "#" && !href.startsWith('#') && !this.getAttribute('data-bs-target') && dataBsToggle !== "tooltip") {
                e.preventDefault();
                if (loader) {
                    loader.classList.remove('hidden');
                }
                setTimeout(() => {
                    window.location.href = href;
                }, 500); // (Thời gian 500ms có thể hơi dài, 100-200ms sẽ mượt hơn)
            }
        });
    });

    // --- PHẦN XỬ LÝ DROPDOWN USER ---
    var dropdownToggle = document.querySelector(".user-dropdown-toggle");
    var dropdownMenu = document.querySelector(".user-dropdown-menu");
    if (dropdownToggle && dropdownMenu) {
        // ... (Toàn bộ logic click của dropdown user) ...
        dropdownToggle.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            dropdownMenu.classList.toggle("show");
        });
        dropdownMenu.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    }
    // Bấm ra ngoài để đóng (CẢ HAI DROPDOWN)
    window.addEventListener("click", function () {
        // 1. Đóng User dropdown
        if (dropdownMenu && dropdownMenu.classList.contains("show")) {
            dropdownMenu.classList.remove("show");
        }
        // 2. Đóng Notification dropdown
        if (notifyMenu && notifyMenu.classList.contains("show")) {
            notifyMenu.classList.remove("show");
        }
    });

    // ----- THÊM MỚI TẠI ĐÂY: KÍCH HOẠT TOOLTIP CỦA BOOTSTRAP -----
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    // --------------------------------------------------------
    // --- THÊM MỚI: PHẦN XỬ LÝ DROPDOWN NOTIFICATION ---
    var notifyToggle = document.querySelector("#notification-toggle");
    var notifyMenu = document.querySelector("#notification-menu");

    if (notifyToggle && notifyMenu) {
        // 1. Khi bấm vào cái chuông
        notifyToggle.addEventListener("click", function (event) {
            event.preventDefault(); // Ngăn link '#' nhảy trang
            event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
            notifyMenu.classList.toggle("show");
        });

        // 2. Khi bấm vào bên trong menu thông báo
        notifyMenu.addEventListener("click", function (event) {
            event.stopPropagation(); // Ngăn click bên trong menu đóng menu
        });
    }
}); // KẾT THÚC KHỐI DOMContentLoaded DUY NHẤT
