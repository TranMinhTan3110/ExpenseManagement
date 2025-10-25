document.addEventListener("DOMContentLoaded", function () {
    // ===== ICON PICKER =====
    const iconToggle = document.getElementById("iconPickerToggle");
    const iconList = document.getElementById("iconPickerList");
    const iconInput = document.getElementById("selectedIcon");
    const iconPreview = document.getElementById("selectedIconPreview");

    // Mở/đóng dropdown icon
    iconToggle.addEventListener("click", () => {
        iconList.style.display =
            iconList.style.display === "none" ? "block" : "none";
    });

    // Gắn sự kiện iconsLoaded trước
    document.addEventListener("iconsLoaded", () => {
        const iconOptionsDynamic = document.querySelectorAll(
            "#iconPickerContainer .icon-option"
        );

        iconOptionsDynamic.forEach((opt) => {
            opt.addEventListener("click", () => {
                iconOptionsDynamic.forEach((o) => o.classList.remove("active"));
                opt.classList.add("active");

                const iconClass = opt.dataset.icon;
                iconInput.value = iconClass;
                iconPreview.innerHTML = `<i class="${iconClass}"></i>`;
                iconList.style.display = "none";
            });
        });
    });

    // Render icon picker sau khi đã gắn listener
    renderIconPicker("iconPickerContainer");

    // Đóng khi click ra ngoài
    document.addEventListener("click", (e) => {
        if (!iconToggle.contains(e.target) && !iconList.contains(e.target)) {
            iconList.style.display = "none";
        }
    });

    // Gán icon cho các phần tử có data-icon-id (hiển thị category)
    document.querySelectorAll("[data-icon-id]").forEach((el) => {
        const iconId = el.dataset.iconId;
        const iconClass = getIconClassById(iconId);
        el.classList.add(...iconClass.split(" "));
    });
});
