// Display current date
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('vi-VN', dateOptions);

// Auto-highlight active menu item
document.addEventListener('DOMContentLoaded', function () {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.toLowerCase().includes(href.toLowerCase())) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});