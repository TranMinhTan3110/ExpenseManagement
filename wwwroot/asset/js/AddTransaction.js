document.addEventListener("DOMContentLoaded", function () {

    // --- 1. Xử lý chọn LOẠI (Chi tiêu / Thu nhập) ---
    const typeCards = document.querySelectorAll('.transaction-type-toggle .type-card');
    const hiddenTypeInput = document.getElementById('TransactionType');

    if (typeCards.length > 0 && hiddenTypeInput) { // Kiểm tra phần tử tồn tại
        typeCards.forEach(card => {
            card.addEventListener('click', function () {
                // Xóa active ở tất cả các thẻ
                typeCards.forEach(c => c.classList.remove('active'));
                // Thêm active cho thẻ được click
                this.classList.add('active');
                // Cập nhật giá trị vào input ẩn
                hiddenTypeInput.value = this.getAttribute('data-type');
            });
        });
    }

    // --- 2. Xử lý chọn DANH MỤC ---
    const categoryCards = document.querySelectorAll('.category-grid .category-card');
    const hiddenCategoryInput = document.getElementById('CategoryId');

    if (categoryCards.length > 0 && hiddenCategoryInput) { // Kiểm tra phần tử tồn tại
        categoryCards.forEach(card => {
            card.addEventListener('click', function () {
                // Xóa active ở tất cả các thẻ
                categoryCards.forEach(c => c.classList.remove('active'));
                // Thêm active cho thẻ được click
                this.classList.add('active');
                // Cập nhật giá trị vào input ẩn
                hiddenCategoryInput.value = this.getAttribute('data-category-id');
            });
        });
    }

    // --- 3. Kích hoạt LỊCH ---
    const datePicker = document.getElementById('datepicker');
    if (datePicker) { // Kiểm tra phần tử tồn tại
        flatpickr("#datepicker", {
            dateFormat: "d-m-Y", // Định dạng ngày-tháng-năm
            wrap: true, // Cần thiết vì chúng ta dùng input-group
            defaultDate: "today" // Mặc định chọn ngày hôm nay
        });
    }

});