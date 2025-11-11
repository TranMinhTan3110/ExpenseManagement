$(document).ready(function () {
    let currentTicketId = null;
    let ticketsTable = null;

    // ===== KHỞI TẠO =====
    loadStatistics();
    initDataTable();

    // ===== LOAD STATISTICS =====
    function loadStatistics() {
        $.ajax({
            url: '/TicketAD/Statistics',
            type: 'GET',
            success: function (data) {
                $('#totalTickets').text(data.totalTickets || data.TotalTickets || 0);
                $('#openTickets').text(data.openTickets || data.OpenTickets || 0);
                $('#pendingTickets').text(data.pendingTickets || data.PendingTickets || 0);
                $('#resolvedTickets').text(data.resolvedTickets || data.ResolvedTickets || 0);
                //$('#urgentTickets').text(data.urgentTickets || data.UrgentTickets || 0);

                //const avgTime = data.averageResponseTime || data.AverageResponseTime || 0;
                //$('#avgResponseTime').text(avgTime.toFixed(1) + 'h');
            },
            error: function (xhr, status, error) {
                console.error('Error loading statistics:', error);
            }
        });
    }

    // ===== KHỞI TẠO DATATABLE =====
    function initDataTable() {
        ticketsTable = $('#ticketsTable').DataTable({
            ajax: {
                url: '/TicketAD/GetAll',
                dataSrc: 'data'
            },
            columns: [
                { data: 'ticketID', render: data => '#' + data },
                { data: 'userName' },
                { data: 'userEmail' },
                {
                    data: 'questionType',
                    render: function (data) {
                        const icons = {
                            'Account': 'bi-person-circle',
                            'Transaction': 'bi-arrow-left-right',
                            'Budget': 'bi-wallet2',
                            'Technical': 'bi-gear',
                            'Other': 'bi-question-circle'
                        };
                        const icon = icons[data] || 'bi-question-circle';
                        return `${data}`;
                    }
                },
                {
                    data: 'status',
                    render: function (data) {
                        const classes = {
                            'Open': 'badge-open',
                            'InProgress': 'badge-inprogress',
                            'Resolved': 'badge-resolved',
                            'Closed': 'badge-closed'
                        };
                        const labels = { 'InProgress': 'In Progress' };
                        const badgeClass = classes[data] || 'badge-open';
                        const label = labels[data] || data;
                        return `<span class="badge ${badgeClass}">${label}</span>`;
                    }
                },
                {
                    data: 'createdAt',
                    render: function (data) {
                        const date = new Date(data);
                        return date.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                },
                {
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                <button class="btn btn-view btn-action btn-sm" onclick="viewTicket(${row.ticketID})">
                    <i class="bi bi-eye"></i> View
                </button>
                <button class="btn btn-delete btn-action btn-sm" onclick="deleteTicket(${row.ticketID})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            `;
                    }
                }
            ],
            order: [[0, 'desc']],
            responsive: true,
            language: {
                search: "Tìm kiếm:",
                lengthMenu: "Hiển thị _MENU_ tickets",
                info: "Hiển thị _START_ đến _END_ trong tổng số _TOTAL_ tickets",
                infoEmpty: "Không có tickets",
                infoFiltered: "(lọc từ _MAX_ tickets)",
                paginate: {
                    first: "Đầu",
                    last: "Cuối",
                    next: "Sau",
                    previous: "Trước"
                },
                emptyTable: "Chưa có ticket nào",
                zeroRecords: "Không tìm thấy ticket nào"
            },
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100], [10, 25, 50, 100]]
        });
    }

    // ===== VIEW TICKET DETAIL =====
    window.viewTicket = function (ticketId) {
        currentTicketId = ticketId;
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
            url: '/TicketAD/Details/' + ticketId,
            type: 'GET',
            success: function (ticket) {
                renderTicketDetail(ticket);
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
    };

    // ===== RENDER TICKET DETAIL =====
    function renderTicketDetail(ticket) {
        const createdDate = new Date(ticket.createdAt || ticket.CreatedAt);
        const updatedDate = new Date(ticket.updatedAt || ticket.UpdatedAt);

        let resolvedInfo = '';
        if (ticket.resolvedAt || ticket.ResolvedAt) {
            const resolvedDate = new Date(ticket.resolvedAt || ticket.ResolvedAt);
            resolvedInfo = `
                <div class="detail-row">
                    <div class="detail-label">Resolved At</div>
                    <div class="detail-value">${resolvedDate.toLocaleString('vi-VN')}</div>
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
                <div class="detail-label"><i class="bi bi-file-text me-2"></i>Description</div>
                <div class="detail-description">${ticket.description || ticket.Description}</div>
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
                        <select class="form-select" id="ticketStatus">
                            <option value="Open" ${(ticket.status || ticket.Status) === 'Open' ? 'selected' : ''}>Open</option>
                            <option value="Pending" ${(ticket.status || ticket.Status) === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Resolved" ${(ticket.status || ticket.Status) === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="detail-row">
                <div class="detail-label"><i class="bi bi-pencil-square me-2"></i>Admin Note</div>
               <textarea class="form-control" id="adminNote" rows="3"
  placeholder="Add your notes here...">${ticket.adminNote || ticket.AdminNote || ''}</textarea>
            </div>

            <div class="row mt-3">
                <div class="col-md-6">
                    <small class="text-muted"><i class="bi bi-clock me-1"></i>Created: ${createdDate.toLocaleString('vi-VN')}</small>
                </div>
                <div class="col-md-6 text-end">
                    <small class="text-muted"><i class="bi bi-clock-history me-1"></i>Updated: ${updatedDate.toLocaleString('vi-VN')}</small>
                </div>
            </div>

            ${resolvedInfo}
        `;

        $('#ticketDetailContent').html(html);
    }

    // ===== SAVE CHANGES =====
    $('#btnSaveChanges').click(function () {
        if (!currentTicketId) return;

        const data = {
            TicketID: currentTicketId,
            Status: $('#ticketStatus').val(),
            //Priority: $('#ticketPriority').val(),
            AdminNote: $('#adminNote').val()
        };

        $.ajax({
            url: '/TicketAD/UpdateStatus',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Ticket updated successfully',
                    timer: 2000,
                    showConfirmButton: false
                });

                $('#ticketDetailModal').modal('hide');
                ticketsTable.ajax.reload();
                loadStatistics();
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed to update ticket: ' + error
                });
            }
        });
    });

    // ===== DELETE TICKET =====
    window.deleteTicket = function (ticketId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/TicketAD/Delete/' + ticketId,
                    type: 'DELETE',
                    success: function (response) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Ticket has been deleted.',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        ticketsTable.ajax.reload();
                        loadStatistics();
                    },
                    error: function (xhr, status, error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Failed to delete ticket: ' + error
                        });
                    }
                });
            }
        });
    };
});