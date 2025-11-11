// ===== VIEW TICKET DETAIL =====
// (Lưu ý: đổi tên thành viewUserTicket để tránh xung đột nếu bạn gộp file)
function viewUserTicket(ticketId) {
    $('#ticketDetailModal').modal('show');

    // Show loading
    $('#ticketDetailContent').html(`
        <div class="text-center py-5">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `);

    $.ajax({
        // THAY ĐỔI URL: Gọi đến API mới trong MyTicketsController
        url: '/MyTickets/Details/' + ticketId,
        type: 'GET',
        success: function (ticket) {
            renderUserTicketDetail(ticket); // Gọi hàm render mới
        },
        error: function (xhr, status, error) {
            $('#ticketDetailContent').html(`
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error loading ticket details: ${error}
                </div>
            `);
        }
    });
}

// ===== RENDER TICKET DETAIL (PHIÊN BẢN CHỈ XEM) =====
function renderUserTicketDetail(ticket) {
    const createdDate = new Date(ticket.createdAt || ticket.CreatedAt);
    const updatedDate = new Date(ticket.updatedAt || ticket.UpdatedAt);

    // Dùng .toLocaleString() để format thời gian cho đẹp
    const createdStr = createdDate.toLocaleString('vi-VN');
    const updatedStr = updatedDate.toLocaleString('vi-VN');

    // Chuyển đổi description (nếu có xuống dòng)
    const descriptionHtml = (ticket.description || ticket.Description)
        .replace(/\n/g, '<br />');

    // Chuyển đổi AdminNote (nếu có)
    let adminNoteHtml = '';
    const adminNote = ticket.adminNote || ticket.AdminNote;
    if (adminNote) {
        adminNoteHtml = `
            <div class="detail-row">
                <div class="detail-label"><i class="bi bi-pencil-square me-2"></i>Admin Note</div>
                <div class="detail-description bg-light p-3 rounded">
                    ${adminNote.replace(/\n/g, '<br />')}
                </div>
            </div>
        `;
    } else {
        adminNoteHtml = `
            <div class="detail-row">
                <div class="detail-label"><i class="bi bi-pencil-square me-2"></i>Admin Note</div>
                <div class="detail-value text-muted">
                    <em>No notes from admin yet.</em>
                </div>
            </div>
        `;
    }

    const html = `
        <div class="row">
            <div class="col-md-6">
                <div class="detail-row">
                    <div class="detail-label"><i class="bi bi-person me-2"></i>User Name</div>
                    <div class="detail-value">${ticket.userName || ticket.UserName}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-row">
                    <div class="detail-label"><i class="bi bi-envelope me-2"></i>Email</div>
                    <div class="detail-value">${ticket.userEmail || ticket.UserEmail}</div>
                </div>
            </div>
        </div>

        <div class="detail-row">
            <div class="detail-label"><i class="bi bi-file-text me-2"></i>My Question</div>
            <div class="detail-description">${descriptionHtml}</div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="detail-row">
                    <div class="detail-label"><i class="bi bi-tag me-2"></i>Question Type</div>
                    <div class="detail-value">${ticket.questionType || ticket.QuestionType}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="detail-row">
                    <div class="detail-label">Status</div>
                    
                    <div class="detail-value">
                        <span class="badge 
                            @(ticket.status == "Resolved" ? "bg-success" : 
                              ticket.status == "Pending" ? "bg-warning" : "bg-primary")">
                            ${ticket.status || ticket.Status}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        ${adminNoteHtml}

        <div class="row mt-3">
            <div class="col-md-6">
                <small class="text-muted"><i class="bi bi-clock me-1"></i>Created: ${createdStr}</small>
            </div>
            <div class="col-md-6 text-end">
                <small class="text-muted"><i class="bi bi-clock-history me-1"></i>Updated: ${updatedStr}</small>
            </div>
        </div>
    `;

    $('#ticketDetailContent').html(html);
}