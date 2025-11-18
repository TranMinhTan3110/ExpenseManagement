// ============= GLOBAL VARIABLES =============
let activeCharts = {};
let notifiedBudgets = new Set(JSON.parse(sessionStorage.getItem('notifiedBudgets') || '[]'));
// Lưu trạng thái đã chúc mừng budget hết hạn
let congratulatedBudgets = new Set(JSON.parse(sessionStorage.getItem('congratulatedBudgets') || '[]'));
let budgetNotificationState = JSON.parse(sessionStorage.getItem('budgetNotificationState') || '{}');
sessionStorage.removeItem("notifiedBudgets");



function isCongratulated(budgetId) {
    return congratulatedBudgets.has(budgetId);
}

function markCongratulated(budgetId) {
    congratulatedBudgets.add(budgetId);
    sessionStorage.setItem('congratulatedBudgets', JSON.stringify([...congratulatedBudgets]));
}

function unmarkCongratulated(budgetId) {
    congratulatedBudgets.delete(budgetId);
    sessionStorage.setItem('congratulatedBudgets', JSON.stringify([...congratulatedBudgets]));
}

// =============  HÀM KIỂM TRA CATEGORY TRÙNG =============
async function checkCategoryInUse(categoryId, excludeBudgetId = null) {
    try {
        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) return false;

        const response = await fetch(`/api/BudgetApi?userId=${userId}`);
        if (!response.ok) return false;

        const budgets = await response.json();

        // Kiểm tra xem category đã được sử dụng chưa
        const categoryInUse = budgets.some(budget =>
            budget.categoryID === parseInt(categoryId) &&
            (!excludeBudgetId || budget.budgetID !== parseInt(excludeBudgetId))
        );

        return categoryInUse;
    } catch (error) {
        console.error('Error checking category:', error);
        return false;
    }
}

// =============      HÀM RELOAD CATEGORY PICKER =============
async function reloadCategoryPicker() {
    const categoryContainer = document.getElementById("categoryPickerContainer");
    if (!categoryContainer) return;

    try {
        const res = await fetch("/api/category/page-data");
        if (!res.ok) return;
        const resData = await res.json();

        const expenseCategories = (resData.userCategories || []).filter(c =>
            (c.type || "").toLowerCase().startsWith("exp")
        );

        const userId = document.getElementById("userIdHidden")?.value;
        let usedCategories = [];
        if (userId) {
            const budgetRes = await fetch(`/api/BudgetApi?userId=${userId}`);
            if (budgetRes.ok) {
                const budgets = await budgetRes.json();
                usedCategories = budgets.map(b => b.categoryID);
            }
        }

        categoryContainer.innerHTML = expenseCategories.map(cat => {
            const iconClass = (cat.icon && cat.icon.iconClass) ? cat.icon.iconClass : "fi fi-rr-ellipsis";
            const name = cat.categoryName || "Category";
            // ✅ FIX: Lấy color từ object Color.hexCode hoặc cat.color (lowercase)
            const color = cat.color?.hexCode || cat.color || cat.Color?.hexCode || "#6c757d";
            const isUsed = usedCategories.includes(cat.categoryID);

            return `
                <div class="category-option border rounded p-2 text-center ${isUsed ? 'disabled' : ''}"
                     data-id="${cat.categoryID}"
                     data-icon="${iconClass}"
                     data-color="${color}"
                     data-used="${isUsed}"
                     title="${name}${isUsed ? ' (Đã được sử dụng)' : ''}"
                     style="width:80px; cursor:${isUsed ? 'not-allowed' : 'pointer'}; 
                            border-color: ${color} !important; 
                            opacity: ${isUsed ? '0.4' : '1'};
                            position: relative;">
                    <i class="${iconClass}" style="font-size:22px; color: ${color};"></i>
                    <div class="small mt-1" style="color: #333;">${name}</div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Error reloading categories:", err);
    }
}



// GET PROGRESS COLOR BASED ON PERCENTAGE
function getProgressColor(percentage) {
    if (percentage >= 90) return '#dc3545'; // Red
    if (percentage >= 70) return '#ffc107'; // Yellow
    return '#28a745'; // Green
}

// SHOW BUDGET WARNING BASED ON PERCENTAGE
function showBudgetWarning(budgetId, percentage, categoryName, spentAmount, budgetAmount) {
    const lastNotifiedPercentage = budgetNotificationState[budgetId] || 0;

    // Xác định threshold hiện tại
    let currentThreshold = 0;
    if (percentage >= 100) currentThreshold = 100;
    else if (percentage >= 90) currentThreshold = 90;
    else if (percentage >= 70) currentThreshold = 70;

    //  Chỉ hiển thị nếu vượt qua threshold MỚI
    if (currentThreshold <= lastNotifiedPercentage) {
        return; // Đã thông báo mức này rồi
    }

    // Cập nhật state
    budgetNotificationState[budgetId] = currentThreshold;
    sessionStorage.setItem('budgetNotificationState', JSON.stringify(budgetNotificationState));

    let title, text, icon, color;
    
    if (percentage >= 100) {
        title = '⚠️ Vượt Ngân Sách!';
        text = `Ngân sách "${categoryName}" đã vượt mức!\nĐã chi: ${spentAmount.toLocaleString('vi-VN')}đ\nNgân sách: ${budgetAmount.toLocaleString('vi-VN')}đ\nVượt: ${(spentAmount - budgetAmount).toLocaleString('vi-VN')}đ`;
        icon = 'error';
        color = '#dc3545';
    } else if (percentage >= 90) {
        title = '🚨 Gần Hết Ngân Sách!';
        text = `Ngân sách "${categoryName}" đã sử dụng ${percentage}%!\nCòn lại: ${(budgetAmount - spentAmount).toLocaleString('vi-VN')}đ`;
        icon = 'warning';
        color = '#dc3545';
    } else if (percentage >= 70) {
        title = '⚡ Cảnh Báo Ngân Sách';
        text = `Ngân sách "${categoryName}" đã sử dụng ${percentage}%\nHãy cân nhắc chi tiêu!`;
        icon = 'warning';
        color = '#ffc107';
    }

    Swal.fire({
        icon: icon,
        title: title,
        html: text.replace(/\n/g, '<br>'),
        confirmButtonText: 'Đã hiểu',
        confirmButtonColor: color,
        timer: percentage >= 100 ? 0 : 5000,
        timerProgressBar: true
    });
}

//  HÀM RELOAD VÀ KIỂM TRA LẠI CẢNH BÁO
async function reloadBudgetsAndCheckWarnings() {
    try {
        //  CHỜ 300ms để đảm bảo backend đã xử lý xong transaction
        await new Promise(resolve => setTimeout(resolve, 300));

        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) return;

        const response = await fetch(`/api/BudgetApi?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to reload budgets');

        const budgets = await response.json();
        window.cachedBudgets = budgets;

        //  Kiểm tra cảnh báo cho TẤT CẢ budgets
        budgets.forEach(budget => {
            showBudgetWarning(
                budget.budgetID,
                budget.percentage,
                budget.categoryName,
                budget.spentAmount,
                budget.budgetAmount
            );

            checkBudgetExpiredSuccess(
                budget.budgetID,
                budget.categoryName,
                budget.endDate,
                budget.remainingAmount,
                budget.budgetAmount,
                budget.percentage
            );
        });

        // Re-render nếu đang ở trang Budget
        if (window.location.pathname.includes('/Budget')) {
            await loadBudgets();
        }

    } catch (error) {
        console.error('Error reloading budgets:', error);
    }
}


function checkBudgetExpiredSuccess(budgetId, categoryName, endDate, remainingAmount, budgetAmount, percentage) {
    if (isCongratulated(budgetId)) return;

    const now = new Date();
    const budgetEndDate = new Date(endDate);

    if (now > budgetEndDate) {
        if (remainingAmount > 0 && percentage < 100) {
            markCongratulated(budgetId);

            const savedPercentage = (100 - percentage).toFixed(0);

            Swal.fire({
                icon: 'success',
                title: '🎉 Chúc Mừng!',
                html: `
                    <div style="text-align: center;">
                        <p style="font-size: 16px; margin-bottom: 15px;">
                            Bạn đã quản lý ngân sách <strong>"${categoryName}"</strong> rất tốt!
                        </p>
                        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="margin: 5px 0;">✅ Đã tiết kiệm được: <strong style="color: #28a745;">${remainingAmount}đ</strong></p>
                            <p style="margin: 5px 0;">📊 Tỷ lệ tiết kiệm: <strong style="color: #28a745;">${savedPercentage}%</strong></p>
                            <p style="margin: 5px 0;">💰 Tổng ngân sách: <strong>${budgetAmount}đ</strong></p>
                        </div>
                        <p style="font-size: 14px; color: #666;">
                            Hãy tiếp tục duy trì thói quen chi tiêu hợp lý! 💪
                        </p>
                    </div>
                `,
                confirmButtonText: 'Cảm ơn!',
                confirmButtonColor: '#28a745',
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut'
                }
            });
        }
    }
}

// TỰ ĐỘNG XÓA VÀ TẠO LẠI RECURRING BUDGETS
async function handleRecurringBudgets() {
    try {
        console.log('🔄 Starting handle recurring budgets...');

        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) {
            console.error('❌ User ID not found');
            return;
        }

        console.log('📤 Calling API with userId:', userId);

        const response = await fetch(`/api/BudgetApi/handle-recurring?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('📥 Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Recurring budgets handled:', result);

            // Reload lại danh sách sau khi xử lý
            await loadBudgets();
        } else {
            const error = await response.text();
            console.error('❌ API error:', error);
        }
    } catch (error) {
        console.error('❌ Exception in handleRecurringBudgets:', error);
    }
}

//  ADD EVENT LISTENERS FOR BUDGET NAV ITEMS
function addBudgetNavEventListeners(budgets) {
    budgets.forEach(budget => {
        const navElement = document.querySelector(`[data-bs-target="#budget-${budget.budgetID}"]`);
        if (navElement) {
            navElement.addEventListener('shown.bs.tab', function (e) {
                showBudgetWarning(
                    budget.budgetID,
                    budget.percentage,
                    budget.categoryName,
                    budget.spentAmount,
                    budget.budgetAmount
                );

                //  Kiểm tra và hiển thị chúc mừng nếu budget hết hạn nhưng chưa cạn
                checkBudgetExpiredSuccess(
                    budget.budgetID,
                    budget.categoryName,
                    budget.endDate,
                    budget.remainingAmount,
                    budget.budgetAmount,
                    budget.percentage
                );
            });
        }
    });
}

window.deleteBudget = async function (budgetId, categoryName) {
    const result = await Swal.fire({
        title: 'Xác nhận xóa',
        text: `Bạn có chắc muốn xóa ngân sách "${categoryName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`/api/BudgetApi/${budgetId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Delete failed');

        // XÓA CHART KHỎI CACHE TRƯỚC KHI XÓA BUDGET
        if (activeCharts[budgetId]) {
            activeCharts[budgetId].destroy();
            delete activeCharts[budgetId];
        }

        await Swal.fire({
            icon: 'success',
            title: 'Đã xóa!',
            text: 'Ngân sách đã được xóa thành công',
            confirmButtonColor: '#28a745',
            timer: 2000
        });

        // Xóa khỏi danh sách đã thông báo
        delete budgetNotificationState[budgetId];
        sessionStorage.setItem('budgetNotificationState', JSON.stringify(budgetNotificationState));

        //  Xóa khỏi danh sách đã chúc mừng
        unmarkCongratulated(budgetId);

        await loadBudgets();

    } catch (error) {
        console.error('Delete error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể xóa ngân sách!',
            confirmButtonColor: '#d33'
        });
    }
};
//  EDIT BUDGET FUNCTION
window.editBudget = async function (budgetId) {
    try {
        const response = await fetch(`/api/BudgetApi/${budgetId}`);
        if (!response.ok) throw new Error('Không thể lấy thông tin ngân sách');

        const budget = await response.json();

        document.getElementById("selectedCategoryID").value = budget.categoryID;
        document.getElementById("budgetAmountInput").value = budget.budgetAmount;
        document.getElementById("budgetStartDateInput").value = budget.startDate.split('T')[0];
        document.getElementById("budgetEndDateInput").value = budget.endDate.split('T')[0];
        document.getElementById("recurringCheckbox").checked = budget.isRecurring || false;

        const recurringCheckbox = document.getElementById("recurringCheckbox");
        if (recurringCheckbox) {
            recurringCheckbox.checked = budget.isRecurring === true;
            console.log('✅ Set isRecurring:', budget.isRecurring); // Debug log
        }

        // Hiển thị category đã chọn
        const categoryPreview = document.getElementById("selectedCategoryPreview");
        if (categoryPreview) {
            categoryPreview.innerHTML = `<i class="${budget.categoryIcon}" style="color: ${budget.categoryColor};"></i> ${budget.categoryName}`;
            categoryPreview.classList.remove("text-muted");
        }

        const categoryToggle = document.getElementById("categoryPickerToggle");
        const categoryList = document.getElementById("categoryPickerList");
        if (categoryToggle) {
            categoryToggle.style.pointerEvents = 'none';
            categoryToggle.style.opacity = '0.6';
            categoryToggle.style.cursor = 'not-allowed';
        }
        if (categoryList) {
            categoryList.style.display = 'none';
        }

        const modalTitle = document.querySelector("#addBudgetModal .modal-title");
        const submitBtn = document.querySelector("#addBudgetForm button[type='submit']");
        if (modalTitle) modalTitle.textContent = "Chỉnh Sửa Ngân Sách";
        if (submitBtn) submitBtn.textContent = "Cập Nhật Ngân Sách";

        document.getElementById("addBudgetForm").dataset.editId = budgetId;

        const modalElement = document.getElementById("addBudgetModal");
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

    } catch (error) {
        console.error('Edit error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải thông tin ngân sách!',
            confirmButtonColor: '#d33'
        });
    }
};

window.updateChartFilters = async function (budgetId) {
    const groupBy = document.getElementById(`groupBy${budgetId}`)?.value || 'day';
    const startDateInput = document.getElementById(`chartStartDate${budgetId}`)?.value;
    const endDateInput = document.getElementById(`chartEndDate${budgetId}`)?.value;

    console.log('🔄 Updating chart filters:');
    console.log('  GroupBy:', groupBy);
    console.log('  Start Date:', startDateInput);
    console.log('  End Date:', endDateInput);

    //  Truyền date ở format YYYY-MM-DD (không có timestamp)
    await renderSpendingChart(budgetId, groupBy, startDateInput, endDateInput);
};

// ============= OPEN ADD BUDGET MODAL =============
window.openAddBudgetModal = async function () {
    const modalElement = document.getElementById("addBudgetModal");
    if (modalElement) {
        const form = document.getElementById("addBudgetForm");
        if (form) {
            form.reset();
            delete form.dataset.editId;
        }

        const modalTitle = document.querySelector("#addBudgetModal .modal-title");
        if (modalTitle) modalTitle.textContent = "Thêm Ngân Sách Mới";

        const submitBtn = document.querySelector("#addBudgetForm button[type='submit']");
        if (submitBtn) submitBtn.textContent = "Lưu Ngân Sách";

        const categoryPreview = document.getElementById("selectedCategoryPreview");
        if (categoryPreview) {
            categoryPreview.innerHTML = "Chọn categories...";
            categoryPreview.classList.add("text-muted");
        }

        const categoryToggle = document.getElementById("categoryPickerToggle");
        if (categoryToggle) {
            categoryToggle.style.pointerEvents = '';
            categoryToggle.style.opacity = '';
            categoryToggle.style.cursor = '';
        }

        await reloadCategoryPicker();

        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.removeAttribute('aria-hidden');
        }

        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// ============= LOAD BUDGETS =============
async function loadBudgets() {
    try {
        const userId = document.getElementById("userIdHidden")?.value;
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        console.log('🔄 Loading budgets for user:', userId);

        const response = await fetch(`/api/BudgetApi?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const budgets = await response.json();
        console.log("✅ Loaded budgets:", budgets);

        window.cachedBudgets = budgets;

        // XÓA TẤT CẢ CHARTS CŨ TRƯỚC KHI LOAD MỚI
        Object.keys(activeCharts).forEach(chartId => {
            if (activeCharts[chartId]) {
                activeCharts[chartId].destroy();
                delete activeCharts[chartId];
            }
        });
        console.log('🗑️ Cleared all old charts');

        if (!budgets || budgets.length === 0) {
            renderEmptyState();
            return;
        }

        renderBudgetNav(budgets);
        renderBudgetTabs(budgets);

        // CHẬM 100MS ĐỂ ĐẢM BẢO DOM ĐÃ RENDER XONG
        setTimeout(() => {
            console.log('📊 Rendering charts...');
            budgets.forEach(budget => {
                renderSpendingChart(budget.budgetID, 'day', budget.startDate, budget.endDate);
            });
        }, 100);

        addBudgetNavEventListeners(budgets);

        if (budgets.length > 0) {
            const firstBudget = budgets[0];
            setTimeout(() => {
                showBudgetWarning(
                    firstBudget.budgetID,
                    firstBudget.percentage,
                    firstBudget.categoryName,
                    firstBudget.spentAmount,
                    firstBudget.budgetAmount
                );

                checkBudgetExpiredSuccess(
                    firstBudget.budgetID,
                    firstBudget.categoryName,
                    firstBudget.endDate,
                    firstBudget.remainingAmount,
                    firstBudget.budgetAmount,
                    firstBudget.percentage
                )
            }, 500);
        }

    } catch (error) {
        console.error("❌ Error loading budgets:", error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể tải danh sách ngân sách!',
            confirmButtonColor: '#d33'
        });
    }
}
// ============= RENDER EMPTY STATE =============
function renderEmptyState() {
    const navContainer = document.querySelector('.budgets-tab .nav .row');
    if (navContainer) {
        navContainer.innerHTML = `
            <div class="col-xl-12 col-md-6">
                <div class="add-budgets-link" onclick="openAddBudgetModal()">
                    <div class="budgets-nav-text"> 
                        <h3 class="budgets-nav-title">Add new budget</h3> 
                    </div> 
                    <div class="add-link-image">
                        <span><img src="/asset/img/more.png" alt=""></span> 
                    </div> 
                </div>
            </div>

            <div class="col-xl-12">
                <div class="text-center py-4">
                    <i class="bi bi-wallet2" style="font-size: 64px; color: #ccc;"></i>
                    <h5 class="mt-3 text-muted">Chưa có ngân sách nào</h5>
                    <p class="text-muted small">Tạo ngân sách đầu tiên của bạn</p>
                </div>
            </div>
        `;
    }

    const tabContent = document.querySelector('.budgets-tab-content');
    if (tabContent) {
        tabContent.innerHTML = `
            <div class="tab-pane show active">
                <div class="budgets-tab-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">N/A</h3>
                </div>

                <div class="row">
                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span style="color: #7184AD; font-size: 14px;">Đã chi</span>
                                    <h3 style="font-weight: bold;">N/A</h3>
                                </div>
                                <div class="text-end">
                                    <span style="color: #7184AD; font-size: 14px;">Ngân sách</span>
                                    <h3 style="font-weight: bold;">N/A</h3>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar" style="width: 0%; background-color: #e9ecef;" role="progressbar"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>0%</span>
                                <span>Còn lại: N/A</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-12">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày bắt đầu</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày kết thúc</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Đã chi</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Còn lại</p>
                                        <h3>N/A</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <h4 class="card-title mb-0">Phân Tích Chi Tiêu</h4>
                                <div class="d-flex gap-2 flex-wrap mt-2 mt-md-0">
                                    <select class="form-select form-select-sm" style="width: auto;" disabled>
                                        <option>Theo Ngày</option>
                                    </select>
                                    <input type="date" class="form-control form-control-sm" style="width: 150px;" disabled>
                                    <span class="align-self-center">đến</span>
                                    <input type="date" class="form-control form-control-sm" style="width: 150px;" disabled>
                                </div>
                            </div>
                            <div class="card-body" style="height: 400px;">
                                <div class="d-flex justify-content-center align-items-center h-100">
                                    <div class="text-center">
                                        <i class="bi bi-bar-chart" style="font-size: 64px; color: #ccc;"></i>
                                        <p class="text-muted mt-3 mb-0">Chưa có dữ liệu phân tích</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// ============= RENDER BUDGET NAV =============
function renderBudgetNav(budgets) {
    const navContainer = document.querySelector('.budgets-tab .nav .row');
    if (!navContainer) return;

    navContainer.innerHTML = '';

    budgets.forEach((budget, index) => {
        const percentage = budget.percentage > 100 ? 100 : budget.percentage;
        const progressColor = getProgressColor(percentage);

        const navItem = `
            <div class="col-xl-12 col-md-6">
                <div class="budgets-nav ${index === 0 ? 'active' : ''}" 
                     data-bs-toggle="pill" 
                     data-bs-target="#budget-${budget.budgetID}"
                     style="--nav-color: ${budget.categoryColor}; background: linear-gradient(to right, #ffffff, ${budget.categoryColor});"
                     data-budget-color="${progressColor}"
                     data-budget-percentage="${percentage}">

                    <div class="budgets-nav-icon">
                        <span><i class="${budget.categoryIcon}" style="color: ${budget.categoryColor}"></i></span>
                    </div>
                    <div class="budgets-nav-text">
                        <h3 class="budgets-nav-title">${budget.categoryName}</h3>
                        <p>${budget.budgetAmount}đ</p>
                    </div>
                </div>
            </div>
        `;
        navContainer.insertAdjacentHTML('beforeend', navItem);
    });

    const addBudgetBtn = `
        <div class="col-xl-12 col-md-6">
            <div class="add-budgets-link" onclick="openAddBudgetModal()">
                <div class="budgets-nav-text"> 
                    <h3 class="budgets-nav-title">Add new budget</h3> 
                </div> 
                <div class="add-link-image">
                    <span><img src="/asset/img/more.png" alt=""></span> 
                </div> 
            </div>
        </div>
    `;
    navContainer.insertAdjacentHTML('beforeend', addBudgetBtn);
}

// ============= RENDER BUDGET TABS =============
function renderBudgetTabs(budgets) {
    const tabContent = document.querySelector('.budgets-tab-content');
    if (!tabContent) return;

    tabContent.innerHTML = '';

    budgets.forEach((budget, index) => {
        const percentage = budget.percentage > 100 ? 100 : budget.percentage;
        const progressColor = getProgressColor(percentage);

        // ✅ Format date ĐÚNG cho input type="date" (YYYY-MM-DD)
        const formatDateForInput = (dateStr) => {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        if (percentage >= 100) {
            budget.remainingAmount = 0;
        }
        const tabPane = `
            <div class="tab-pane ${index === 0 ? 'show active' : ''}" id="budget-${budget.budgetID}">
                <div class="budgets-tab-title" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">${budget.categoryName}</h3>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary me-2 rounded" onclick="editBudget(${budget.budgetID})">
                            <i class="fi fi-rr-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger rounded" onclick="deleteBudget(${budget.budgetID}, '${budget.categoryName}')">
                            <i class="fi fi-rr-trash"></i> Xóa
                        </button>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <span style="color: #7184AD; font-size: 14px;">Đã chi</span>
                                    <h3 style="font-weight: bold;">${budget.spentAmount.toLocaleString('vi-VN')}đ</h3>
                                </div>
                                <div class="text-end">
                                    <span style="color: #7184AD; font-size: 14px;">Ngân sách</span>
                                    <h3 style="font-weight: bold;">${budget.budgetAmount.toLocaleString('vi-VN')}đ</h3>
                                </div>
                            </div>
                            <div class="progress" style="height: 10px;">
                                <div class="progress-bar" style="width: ${percentage}%; background-color: ${progressColor};" role="progressbar"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <span>${percentage}%</span>
                                <span>Còn lại: ${budget.remainingAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-xxl-12">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày bắt đầu</p>
                                        <h3>${new Date(budget.startDate).toLocaleDateString('vi-VN')}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Ngày kết thúc</p>
                                        <h3>${new Date(budget.endDate).toLocaleDateString('vi-VN')}</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Đã chi</p>
                                        <h3>${budget.spentAmount.toLocaleString('vi-VN')}đ</h3>
                                    </div>
                                </div>
                                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                                    <div class="budget-widget">
                                        <p style="color: #7184AD;">Còn lại</p>
                                        <h3 style="color: ${budget.remainingAmount < 0 ? '#dc3545' : '#28a745'}">
                                            ${budget.remainingAmount.toLocaleString('vi-VN')}đ
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-12">
                        <div class="card-body">
                            <div class="card-header d-flex justify-content-between align-items-center flex-wrap">
                                <h4 class="card-title mb-0">Phân Tích Chi Tiêu</h4>
                                
                                <div class="d-flex gap-2 flex-wrap mt-2 mt-md-0 form-contain">
                                    <select id="groupBy${budget.budgetID}" class="form-select form-select-sm" style="width: auto; gap: 8px;" onchange="updateChartFilters(${budget.budgetID})">
                                        <option value="day">Theo Ngày</option>
                                        <option value="week">Theo Tuần</option>
                                        <option value="month">Theo Tháng</option>
                                    </select>
                                    <input type="date" id="chartStartDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.startDate)}" 
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                    <span class="align-self-center">đến</span>
                                    <input type="date" id="chartEndDate${budget.budgetID}" class="form-control form-control-sm" 
                                           value="${formatDateForInput(budget.endDate)}"
                                           style="width: 150px;"
                                           onchange="updateChartFilters(${budget.budgetID})">
                                </div>
                            </div>
                            <div class="card-body" style="height: 500px; padding: 20px;">
                                <canvas id="chartSpending${budget.budgetID}"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        tabContent.insertAdjacentHTML('beforeend', tabPane);
    });
}

// ============= RENDER SPENDING CHART =============
async function renderSpendingChart(budgetId, groupBy = 'day', startDate = null, endDate = null) {
    try {
        // XÓA CHART CŨ TRƯỚC KHI TẠO MỚI
        if (activeCharts[budgetId]) {
            activeCharts[budgetId].destroy();
            delete activeCharts[budgetId];
        }

        // BUILD API URL với date formatting đúng
        let url = `/api/BudgetApi/spending-analysis/${budgetId}?groupBy=${groupBy}`;

        // ✅ Format date đúng chuẩn ISO (YYYY-MM-DD) để tránh lỗi timezone
        if (startDate) {
            const start = typeof startDate === 'string' ? startDate.split('T')[0] : startDate;
            url += `&startDate=${start}`;
        }
        if (endDate) {
            const end = typeof endDate === 'string' ? endDate.split('T')[0] : endDate;
            url += `&endDate=${end}`;
        }

        console.log('🌐 Calling API:', url);

        // FETCH DATA
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        console.log('📥 API Response:', result);
        console.log('📊 Data points:', result.data?.length || 0);

        const ctx = document.getElementById(`chartSpending${budgetId}`);

        if (!ctx) {
            console.error('❌ Canvas element not found:', `chartSpending${budgetId}`);
            return;
        }

        // ✅ LƯU REFERENCE TRƯỚC KHI REMOVE
        const parentElement = ctx.parentElement;
        const canvasId = ctx.id;

        if (!parentElement) {
            console.error('❌ Parent element not found');
            return;
        }

        // XÓA CANVAS CŨ
        ctx.remove();

        // TẠO CANVAS MỚI
        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        parentElement.appendChild(newCanvas);

        // LẤY REFERENCE MỚI
        const newCtx = document.getElementById(canvasId);

        if (!newCtx) {
            console.error('❌ Failed to create new canvas');
            return;
        }

        // CHECK IF DATA IS EMPTY
        if (!result.data || result.data.length === 0) {
            parentElement.innerHTML = `
                <div class="d-flex justify-content-center align-items-center h-100">
                    <div class="text-center">
                        <i class="bi bi-bar-chart" style="font-size: 64px; color: #ccc;"></i>
                        <p class="text-muted mt-3 mb-0">Chưa có dữ liệu trong khoảng thời gian này</p>
                    </div>
                </div>
            `;
            return;
        }

        // PREPARE CHART DATA
        const labels = result.data.map(d => d.label);
        const amounts = result.data.map(d => d.amount);

        console.log('📊 Labels:', labels);
        console.log('💰 Amounts:', amounts);

        // CALCULATE BAR WIDTH BASED ON DATA COUNT
        const dataCount = labels.length;
        let barPercentage = 0.8;
        let categoryPercentage = 0.9;

        if (dataCount <= 5) {
            barPercentage = 0.2;
            categoryPercentage = 0.3;
        } else if (dataCount <= 10) {
            barPercentage = 0.5;
            categoryPercentage = 0.6;
        }

        // CREATE NEW CHART
        activeCharts[budgetId] = new Chart(newCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Chi tiêu',
                    data: amounts,
                    backgroundColor: '#2F2CD8',
                    borderColor: '#2F2CD8',
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: '#1e1b9f',
                    barPercentage: barPercentage,
                    categoryPercentage: categoryPercentage
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                devicePixelRatio: window.devicePixelRatio || 2,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function (context) {
                                return 'Chi tiêu: ' + context.parsed.y.toLocaleString('vi-VN') + 'đ';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            maxRotation: 45,
                            minRotation: 45,
                            padding: 8
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#666',
                            font: {
                                size: 12,
                                weight: '500'
                            },
                            padding: 10,
                            callback: function (value) {
                                return value.toLocaleString('vi-VN') + 'đ';
                            }
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('✅ Chart created successfully for budget:', budgetId);

    } catch (error) {
        console.error(' ❌ Error rendering spending chart:', error);

        // TÌM PARENT ELEMENT AN TOÀN
        const ctx = document.getElementById(`chartSpending${budgetId}`);
        const parentElement = ctx?.parentElement;

        if (parentElement) {
            parentElement.innerHTML = `
                <div class="text-center py-5 text-danger">
                    <i class="bi bi-exclamation-circle" style="font-size: 48px;"></i>
                    <p class="mt-2 mb-0">Không thể tải dữ liệu biểu đồ</p>
                    <p class="small text-muted">${error.message}</p>
                </div>
            `;
        }
    }
}
// ============= DOM CONTENT LOADED =============
document.addEventListener("DOMContentLoaded", async function () {

    // 1) LOAD BUDGETS FIRST
    await loadBudgets();

    // 1.5) XỬ LÝ RECURRING BUDGETS TỰ ĐỘNG
    await handleRecurringBudgets();

    // 2) FIX MODAL EVENT LISTENERS
    const modalElement = document.getElementById("addBudgetModal");
    if (modalElement) {
        modalElement.addEventListener('show.bs.modal', function () {
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.removeAttribute('aria-hidden');
            }
        });

        modalElement.addEventListener('hidden.bs.modal', function () {
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }

            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.removeAttribute('aria-hidden');
            }

            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        });
    }

    async function initializeCategoryPicker() {
        const categoryToggle = document.getElementById("categoryPickerToggle");
        const categoryList = document.getElementById("categoryPickerList");
        const categoryContainer = document.getElementById("categoryPickerContainer");
        const categoryPreview = document.getElementById("selectedCategoryPreview");
        const hiddenInput = document.getElementById("selectedCategoryID");

        if (categoryToggle && categoryContainer) {
            try {
                const res = await fetch("/api/category/page-data");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const resData = await res.json();

                console.log('📦 Full API Response:', resData); // Debug log

                const expenseCategories = (resData.userCategories || []).filter(c =>
                    (c.type || "").toLowerCase().startsWith("exp")
                );

                console.log('📁 Expense Categories:', expenseCategories); // Debug log

                const userId = document.getElementById("userIdHidden")?.value;
                let usedCategories = [];
                if (userId) {
                    try {
                        const budgetRes = await fetch(`/api/BudgetApi?userId=${userId}`);
                        if (budgetRes.ok) {
                            const budgets = await budgetRes.json();
                            usedCategories = budgets.map(b => b.categoryID);
                        }
                    } catch (err) {
                        console.error("Không thể load budgets:", err);
                    }
                }

                categoryContainer.innerHTML = expenseCategories.map(cat => {
                    const iconClass = (cat.icon && cat.icon.iconClass) ? cat.icon.iconClass : "fi fi-rr-ellipsis";
                    const name = cat.categoryName || "Category";

                    //  KIỂM TRA TẤT CẢ CÁCH CÓ THỂ LẤY COLOR
                    let color = "#6c757d"; // Default gray

                    if (cat.color) {
                        if (typeof cat.color === 'string') {
                            color = cat.color; // Nếu color là string trực tiếp
                        } else if (cat.color.hexCode) {
                            color = cat.color.hexCode; // Nếu color là object với hexCode (lowercase)
                        } else if (cat.color.HexCode) {
                            color = cat.color.HexCode; // Nếu color là object với HexCode (uppercase)
                        }
                    } else if (cat.Color) {
                        if (typeof cat.Color === 'string') {
                            color = cat.Color;
                        } else if (cat.Color.hexCode) {
                            color = cat.Color.hexCode;
                        } else if (cat.Color.HexCode) {
                            color = cat.Color.HexCode;
                        }
                    }

                    console.log(`🎨 Category: ${name}, Color: ${color}`, cat); // Debug mỗi category

                    const isUsed = usedCategories.includes(cat.categoryID);

                    return `
                    <div class="category-option border rounded p-2 text-center ${isUsed ? 'disabled' : ''}"
                         data-id="${cat.categoryID}"
                         data-icon="${iconClass}"
                         data-color="${color}"
                         data-used="${isUsed}"
                         title="${name}${isUsed ? ' (Đã được sử dụng)' : ''}"
                         style="width:80px; cursor:${isUsed ? 'not-allowed' : 'pointer'}; 
                                border-color: ${color} !important; 
                                opacity: ${isUsed ? '0.4' : '1'};
                                position: relative;">
                        <i class="${iconClass}" style="font-size:22px; color: ${color};"></i>
                        <div class="small mt-1" style="color: #333;">${name}</div>
                    </div>
                `;
                }).join("");
            } catch (err) {
                console.error("❌ Lỗi khi tải categories:", err);
                categoryContainer.innerHTML = `<div class="text-muted small">Không tải được categories</div>`;
            }

            if (categoryList) {
                categoryToggle.addEventListener("click", () => {
                    const cur = window.getComputedStyle(categoryList).display;
                    categoryList.style.display = (cur === "none" ? "block" : "none");
                });
            }

            // Click handler với validation
            categoryContainer.addEventListener("click", (e) => {
                const item = e.target.closest(".category-option");
                if (!item) return;

                if (item.dataset.used === "true") {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Category đã được sử dụng',
                        text: 'Category này đã có budget. Vui lòng chọn category khác!',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#ffc107'
                    });
                    return;
                }

                categoryContainer.querySelectorAll(".category-option")
                    .forEach(el => el.classList.remove("active"));
                item.classList.add("active");

                const iconClass = item.dataset.icon;
                const color = item.dataset.color;
                const label = item.getAttribute("title") || "Category";

                if (categoryPreview) {
                    categoryPreview.innerHTML = `<i class="${iconClass}" style="color: ${color};"></i> ${label}`;
                    categoryPreview.classList.remove("text-muted");
                }
                if (hiddenInput) hiddenInput.value = item.dataset.id;
                if (categoryList) categoryList.style.display = "none";
            });
        }
    }

    // 3)  INITIALIZE CATEGORY PICKER WITH COLOR FIX
    await initializeCategoryPicker();

    // 4) QUICK RANGE BUTTONS
    const rangeBtns = document.querySelectorAll(".range-btn");
    const startDateInput = document.getElementById("budgetStartDateInput");
    const endDateInput = document.getElementById("budgetEndDateInput");

    if (rangeBtns && rangeBtns.length && startDateInput && endDateInput) {
        const formatDate = (date) => date.toISOString().split("T")[0];

        rangeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                rangeBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const range = parseInt(btn.getAttribute("data-range"), 10) || 0;
                const start = new Date();
                const end = new Date();
                end.setDate(start.getDate() + range);

                startDateInput.value = formatDate(start);
                endDateInput.value = formatDate(end);
            });
        });
    }

    // 5) SUBMIT ADD/EDIT BUDGET FORM
    const form = document.getElementById("addBudgetForm");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const userId = document.getElementById("userIdHidden")?.value;
            const categoryId = document.getElementById("selectedCategoryID")?.value;
            const amountRaw = document.getElementById("budgetAmountInput")?.value;
            const amount = amountRaw ? parseFloat(amountRaw) : 0;
            const start = document.getElementById("budgetStartDateInput")?.value;
            const end = document.getElementById("budgetEndDateInput")?.value;
            const isRecurring = document.getElementById("recurringCheckbox")?.checked || false;

            if (!categoryId) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Thiếu thông tin',
                    text: 'Vui lòng chọn danh mục!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }

            const editId = form.dataset.editId;
            const categoryInUse = await checkCategoryInUse(categoryId, editId);

            if (categoryInUse) {
                Swal.fire({
                    icon: 'error',
                    title: 'Category đã được sử dụng',
                    text: 'Category này đã có budget khác. Vui lòng chọn category khác!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
                return;
            }

            const submitBtn = form.querySelector("button[type='submit']");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Đang xử lý...";
            }

            const isEditMode = !!editId;

            const budgetData = {
                userID: userId,
                categoryID: parseInt(categoryId, 10),
                budgetAmount: amount,
                startDate: start,
                endDate: end,
                isRecurring: isRecurring
            };

            budgetData.UserID = String(userId);

            if (isEditMode) {
                budgetData.BudgetID = parseInt(editId, 10);
            }

            try {
                const url = isEditMode ? `/api/BudgetApi/${editId}` : "/api/BudgetApi";
                const method = isEditMode ? "PUT" : "POST";

                const response = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(budgetData)
                });

                if (!response.ok) {
                    const text = await response.text().catch(() => null);
                    console.error("Lỗi:", response.status, text);

                    Swal.fire({
                        icon: 'error',
                        title: isEditMode ? 'Cập nhật thất bại' : 'Thêm thất bại',
                        text: text || `Lỗi: ${response.status}`,
                        confirmButtonText: 'Đóng',
                        confirmButtonColor: '#d33'
                    });
                    return;
                }

                await Swal.fire({
                    icon: 'success',
                    title: 'Thành công!',
                    text: isEditMode ? 'Ngân sách đã được cập nhật' : 'Ngân sách đã được thêm thành công',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745',
                    timer: 2000,
                    timerProgressBar: true
                });

                const modalElement = document.getElementById("addBudgetModal");
                if (modalElement) {
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }

                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    setTimeout(async () => {
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) backdrop.remove();

                        const appContainer = document.querySelector('.app-container');
                        if (appContainer) appContainer.removeAttribute('aria-hidden');

                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';

                        form.reset();
                        delete form.dataset.editId;

                        const modalTitle = document.querySelector("#addBudgetModal .modal-title");
                        if (modalTitle) modalTitle.textContent = "Thêm Ngân Sách Mới";

                        const categoryPreview = document.getElementById("selectedCategoryPreview");
                        if (categoryPreview) {
                            categoryPreview.innerHTML = "Chọn categories...";
                            categoryPreview.classList.add("text-muted");
                        }

                        await loadBudgets();
                    }, 300);
                }

            } catch (err) {
                console.error("❌ Lỗi:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Có lỗi xảy ra',
                    text: 'Không thể kết nối đến server!',
                    confirmButtonText: 'Đóng',
                    confirmButtonColor: '#d33'
                });
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = isEditMode ? "Cập Nhật Ngân Sách" : "Lưu Ngân Sách";
                }
            }
        });
    }

    window.reloadBudgetsAndCheckWarnings = reloadBudgetsAndCheckWarnings;
});