/* === PHẦN 1: HIỂN THỊ NGÀY THÁNG === */
const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const currentDateEl = document.getElementById('currentDate');
if (currentDateEl) {
    currentDateEl.textContent = new Date().toLocaleDateString('vi-VN', dateOptions);
}

/* === PHẦN 2: LOGIC ACTIVE MENU (ĐÃ SỬA LỖI) === */
document.addEventListener('DOMContentLoaded', function () {

    const currentPath = window.location.pathname.toLowerCase();

    const navLinks = document.querySelectorAll('.sidebar .nav-pills .nav-link');

    let bestMatch = null;
    let bestMatchLength = 0;

    navLinks.forEach(link => {
        link.classList.remove('active');

        const linkPath = new URL(link.href).pathname.toLowerCase();

        let matchPath = linkPath;

        if (matchPath.endsWith('/index')) {
            matchPath = matchPath.substring(0, matchPath.lastIndexOf('/index'));
        }

        if (matchPath === "") {
            matchPath = "/";
        }

        if (currentPath.startsWith(matchPath)) {

            if (matchPath.length > bestMatchLength) {
                bestMatchLength = matchPath.length;
                bestMatch = link;
            }
        }
    });

    if (bestMatch) {
        bestMatch.classList.add('active');
    }
});