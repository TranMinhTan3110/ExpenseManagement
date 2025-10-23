// theme-utils.js
function getLegendColor() {
    return getComputedStyle(document.documentElement)
        .getPropertyValue('--text-color').trim();
}
