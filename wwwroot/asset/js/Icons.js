// js/icons.js

// Danh sách icon có thể chọn (dùng chung toàn site)
const ICONS = [
    { id: "usd", class: " fi fi-rr-usd-circle", label: "USD" },
    { id: "shopping", class: "fi fi-rr-shopping-bag", label: "Shopping" },
    { id: "utensils", class: "fi fi-rr-utensils", label: "Food" },
    { id: "home", class: "fi fi-rr-home", label: "Home" },
    { id: "wallet", class: "fi fi-rr-wallet", label: "Wallet" },
    { id: "car", class: "fi fi-rr-car", label: "Car" },
    { id: "plane", class: "fi fi-rr-plane", label: "Travel" },
    { id: "gift", class: "fi fi-rr-gift", label: "Gift" },
    { id: "book", class: "fi fi-rr-book", label: "Book" },
    { id: "music", class: "fi fi-rr-music", label: "Music" },
    { id: "shopping-cart", class: "fi fi-rr-shopping-cart", label: "Cart" },
    { id: "bills", class: "fi fi-rr-receipt", label: "Bills" },
    { id: "health", class: "fi fi-rr-user-md", label: "Health" },
    { id: "game", class: "fi fi-rr-gamepad", label: "Game" },
    { id: "work", class: "fi fi-rr-briefcase", label: "Work" },
    { id: "education", class: "fi fi-rr-graduation-cap", label: "Education" },
    { id: "insurance", class: "fi fi-bs-user-shield", label: "Insurance" },
    { id: "family", class: "fi fi-sr-family", label: "Family" },
    // ... bạn thêm bao nhiêu tùy ý
];

// Hàm render icon picker
function renderIconPicker(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ICONS.map(
        (icon) => `
      <div class="icon-option" data-icon="${icon.class}" title="${icon.label}">
        <i class="${icon.class}"></i>
      </div>
    `
    ).join("");

    document.dispatchEvent(new Event("iconsLoaded"));
}
