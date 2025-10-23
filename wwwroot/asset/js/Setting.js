document.addEventListener("DOMContentLoaded", function () {
    // Tìm đến ô input có id là 'datepicker'
    flatpickr("#datepicker", {
        // Tùy chọn thêm (ví dụ: định dạng ngày)
        wrap: true,
        dateFormat: "d-m-Y", // Hiển thị dạng ngày-tháng-năm
        
    });
});