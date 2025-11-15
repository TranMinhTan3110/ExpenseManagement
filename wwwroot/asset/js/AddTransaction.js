document.addEventListener("DOMContentLoaded", function () {

    // --- 1. LẤY CÁC ELEMENT ---
    const typeToggles = document.querySelectorAll('.transaction-type-toggle .type-card');
    const hiddenTypeInput = document.getElementById('TransactionType');
    const categoryContainer = document.getElementById('category-grid-container');
    const hiddenCategoryInput = document.getElementById('CategoryId');
    const walletSelect = document.getElementById('WalletID');
    const transactionForm = document.getElementById('transactionForm');
    const datePickerInput = document.getElementById('Date');

    // --- 2. HÀM GỌI API (MỚI) ---

    // Hàm này chạy 1 LẦN DUY NHẤT khi tải trang
    async function loadInitialData() {
        try {
            // Gọi API "form-data" (lấy cả Ví và Category "Expense" mặc định)
            const response = await fetch('/api/transaction/form-data');
            if (!response.ok) throw new Error('Lỗi tải dữ liệu ban đầu');

            const data = await response.json();

            // Vẽ danh sách Ví (Wallets)
            renderWallets(data.wallets);
            // Vẽ danh sách Category (mặc định là Expense)
            renderCategories(data.categories);

        } catch (error) {
            console.error("Lỗi loadInitialData:", error);
            walletSelect.innerHTML = '<option value="">Lỗi tải ví</option>';
            categoryContainer.innerHTML = '<div class="col-12 text-danger">Lỗi tải danh mục.</div>';
        }
    }

    // Hàm này chạy MỖI KHI BẤM TAB (Income/Expense)
    async function loadCategoriesByType(type) {
        try {
            categoryContainer.innerHTML = '<div class="col-12 text-muted">Đang tải...</div>';
            hiddenCategoryInput.value = ''; // Reset

            // Gọi API: GET /api/transaction/categories?type=...
            const response = await fetch(`/api/transaction/categories?type=${type}`);
            if (!response.ok) throw new Error('Lỗi tải danh mục');

            const categories = await response.json();
            renderCategories(categories); // Gọi hàm "vẽ"

        } catch (error) {
            console.error("Lỗi tải category:", error);
            categoryContainer.innerHTML = '<div class="col-12 text-danger">Lỗi kết nối.</div>';
        }
    }

    // --- 3. HÀM "VẼ" GIAO DIỆN (MỚI) ---

    // Hàm "vẽ" (render) danh sách Ví vào <select>
    function renderWallets(wallets) {
        walletSelect.innerHTML = ''; // Xóa "Đang tải..."
        walletSelect.innerHTML = '<option value="" selected disabled>Chọn một ví...</option>';

        if (wallets && wallets.length > 0) {
            wallets.forEach(wallet => {
                walletSelect.innerHTML += `<option value="${wallet.walletID}">${wallet.walletName} (${wallet.balance.toLocaleString()}đ)</option>`;
            });
        }
    }

    // Hàm "vẽ" (render) các Category Card
    function renderCategories(categories) {
        categoryContainer.innerHTML = ''; // Xóa rỗng

        if (!categories || categories.length === 0) {
            categoryContainer.innerHTML = '<div class="col-12 text-muted">Không tìm thấy danh mục nào.</div>';
            return;
        }

        categories.forEach(cat => {
            const col = document.createElement('div');
            col.className = 'col-3 col-md-2';
            col.innerHTML = `
                <div class="category-card" data-category-id="${cat.categoryID}">
                    <div class="category-icon">
                        <i class="${cat.icon.iconClass}" style="color: ${cat.color.hexCode};"></i>
                    </div>
                    <span>${cat.categoryName}</span>
                </div>
            `;
            categoryContainer.appendChild(col);
        });
    }

    // --- 4. GÁN SỰ KIỆN CLICK ---

    // Xử lý chuyển tab
    typeToggles.forEach(card => {
        card.addEventListener('click', function () {
            typeToggles.forEach(c => c.classList.remove('active'));
            this.classList.add('active');

            const type = this.getAttribute('data-type');
            hiddenTypeInput.value = type;

            // Gọi API để tải category cho type này
            loadCategoriesByType(type);
        });
    });

    // Xử lý chọn 1 Category
    categoryContainer.addEventListener('click', function (e) {
        const card = e.target.closest('.category-card');
        if (!card) return;

        categoryContainer.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        hiddenCategoryInput.value = card.dataset.categoryId;
    });

    // --- 5. KÍCH HOẠT LỊCH (FLATPICKR) ---
    const datePicker = document.getElementById('datepicker');
    if (datePicker) {
        flatpickr(datePicker, {
            dateFormat: "Z", // Sửa: Dùng Y-m-d H:i để khớp với C# DateTime
            enableTime: true,
            wrap: true,
            defaultDate: new Date(), // Mặc định chọn ngày giờ hôm nay
    altInput: true,
            altFormat: "d-m-Y H:i"
        });
    }

    // --- 6. CHẠY HÀM TẢI DỮ LIỆU BAN ĐẦU ---
    loadInitialData();


    // --- 7. (MỚI) XỬ LÝ NÚT "THÊM GIAO DỊCH" ---
    transactionForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(transactionForm);
        const data = {
            Amount: parseFloat(formData.get("Amount")),
            Type: formData.get("Type"),
            CategoryID: parseInt(formData.get("CategoryID")),
            WalletID: parseInt(formData.get("WalletID")),
            TransactionDate: formData.get("TransactionDate"),
            Description: formData.get("Description")
            
        };


        // Kiểm tra lỗi
        if (!data.Amount || !data.Type || !data.CategoryID || !data.TransactionDate) {
            Swal.fire("Thiếu thông tin", "Vui lòng điền đầy đủ Số tiền, Loại, Danh mục, Ví và Ngày.", "warning");
            return;
        }


        try {
            const response = await fetch('/api/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (window.reloadBudgetsAndCheckWarnings) {
                await window.reloadBudgetsAndCheckWarnings();
            }

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Thêm thành công!",
                    showConfirmButton: false,
                    timer: 1500
                });
                // Reset form
                transactionForm.reset();
                // Reset category (về mặc định)
                loadCategoriesByType('Expense');
                // Set lại tab "Chi tiêu"
                document.querySelector('.type-card[data-type="Expense"]').classList.add('active');
                document.querySelector('.type-card[data-type="Income"]').classList.remove('active');
                hiddenTypeInput.value = 'Expense';
                const selectedWalletId = parseInt(formData.get("WalletID"));
                if (typeof loadWalletDetails === 'function' && selectedWalletId) {
                    loadWalletDetails(selectedWalletId);  // <--- Tải lại chi tiết ví (bao gồm Transaction History)
                } 


            } else {
                // Xử lý lỗi từ backend (ví dụ: "Số dư không đủ")
                const errorData = await response.json();
                Swal.fire("Lỗi!", errorData.message || "Không thể lưu giao dịch.", "error");
            }

        } catch (error) {
            console.error("Lỗi khi submit:", error);
            Swal.fire("Lỗi kết nối", "Không thể kết nối đến máy chủ.", "error");
        }
    });

});