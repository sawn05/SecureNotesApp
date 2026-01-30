// ===== UTILITY FUNCTIONS =====
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

// ===== SIDEBAR TOGGLE =====
function initSidebar() {
    const sidebar = $('.sidebar');
    const menuToggle = $('#menuToggle');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initSearch() {
    const searchInput = $('#searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = $$('.account-item, .task-item, .note-card');

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = '';
                item.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

// ===== ACCOUNT MANAGEMENT =====
function togglePasswordVisibility(button) {
    const field = button.closest('.account-field');
    const valueElement = field.querySelector('.field-value');
    const icon = button.querySelector('svg');

    if (valueElement.classList.contains('masked-text')) {
        // Show password
        valueElement.classList.remove('masked-text');
        valueElement.textContent = 'ActualPassword123'; // This would come from backend
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
        `;
    } else {
        // Hide password
        valueElement.classList.add('masked-text');
        valueElement.textContent = 'S8****28';
        icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        `;
    }
}

function copyToClipboard(button, text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show feedback
        const originalHTML = button.innerHTML;
        button.innerHTML = '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        button.style.background = '#10b981';
        button.style.borderColor = '#10b981';
        button.style.color = 'white';

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
            button.style.borderColor = '';
            button.style.color = '';
        }, 2000);
    });
}

// ===== MODAL FUNCTIONS =====
function openAddAccountModal() {
    showNotification('Chức năng thêm tài khoản đang được phát triển', 'info');
}

function openAddTaskModal() {
    showNotification('Chức năng thêm task đang được phát triển', 'info');
}

function openAddNoteModal() {
    showNotification('Chức năng thêm ghi chú đang được phát triển', 'info');
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = $('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${type === 'success' ?
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
            </svg>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 24px;
            right: 24px;
            background: white;
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            border-left: 4px solid;
        }
        
        .notification-success { border-color: #10b981; }
        .notification-error { border-color: #ef4444; }
        .notification-warning { border-color: #f59e0b; }
        .notification-info { border-color: #3b82f6; }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .notification-content svg {
            flex-shrink: 0;
        }
        
        .notification-success svg { color: #10b981; }
        .notification-error svg { color: #ef4444; }
        .notification-warning svg { color: #f59e0b; }
        .notification-info svg { color: #3b82f6; }
        
        .notification-close {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            color: #64748b;
            transition: color 0.2s;
        }
        
        .notification-close:hover {
            color: #0f172a;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ===== CALENDAR FUNCTIONS =====
function initCalendar() {
    const calendarDays = $$('.calendar-day');

    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            // Remove active from all days
            calendarDays.forEach(d => d.classList.remove('active'));
            // Add active to clicked day
            day.classList.add('active');

            // Load tasks for this day (would come from backend)
            const date = day.dataset.date;
            loadTasksForDate(date);
        });
    });
}

function loadTasksForDate(date) {
    showNotification(`Đang tải tasks cho ngày ${date}`, 'info');
}

// ===== TASK MANAGEMENT =====
function toggleTaskComplete(checkbox) {
    const taskItem = checkbox.closest('.task-item');
    const taskText = taskItem.querySelector('.task-text');

    if (checkbox.checked) {
        taskItem.classList.add('completed');
        taskText.style.textDecoration = 'line-through';
        taskText.style.opacity = '0.6';
        showNotification('Task đã hoàn thành!', 'success');
    } else {
        taskItem.classList.remove('completed');
        taskText.style.textDecoration = '';
        taskText.style.opacity = '';
    }
}

function deleteTask(button) {
    if (confirm('Bạn có chắc muốn xóa task này?')) {
        const taskItem = button.closest('.task-item');
        taskItem.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            taskItem.remove();
            showNotification('Đã xóa task', 'success');
        }, 300);
    }
}

// ===== MODERN NOTE EDITOR (replaces deprecated execCommand) =====
function initNoteEditor() {
    const editor = $('#noteEditor');
    if (!editor) return;

    // Make editor contenteditable if not already
    editor.setAttribute('contenteditable', 'true');

    // Format buttons using modern approach
    $$('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.dataset.command;
            applyFormatting(command, editor);
        });
    });

    // Image upload
    const imageBtn = $('#imageUpload');
    if (imageBtn) {
        imageBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        insertImage(event.target.result, editor);
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });
    }

    // Table insert
    const tableBtn = $('#tableInsert');
    if (tableBtn) {
        tableBtn.addEventListener('click', () => {
            insertTable(editor);
        });
    }
}

// Modern formatting function to replace execCommand
function applyFormatting(command, editor) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    switch (command) {
        case 'bold':
            wrapSelectionWithTag('strong', range);
            break;
        case 'italic':
            wrapSelectionWithTag('em', range);
            break;
        case 'underline':
            wrapSelectionWithTag('u', range);
            break;
        case 'strikeThrough':
            wrapSelectionWithTag('s', range);
            break;
        case 'insertUnorderedList':
            createList('ul', range, editor);
            break;
        case 'insertOrderedList':
            createList('ol', range, editor);
            break;
        case 'justifyLeft':
            applyAlignment('left', range);
            break;
        case 'justifyCenter':
            applyAlignment('center', range);
            break;
        case 'justifyRight':
            applyAlignment('right', range);
            break;
        default:
            break;
    }

    editor.focus();
}

function wrapSelectionWithTag(tagName, range) {
    const selectedContent = range.extractContents();
    const wrapper = document.createElement(tagName);
    wrapper.appendChild(selectedContent);
    range.insertNode(wrapper);

    // Restore selection
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
}

function createList(listType, range, editor) {
    const list = document.createElement(listType);
    const li = document.createElement('li');

    const selectedContent = range.extractContents();
    li.appendChild(selectedContent);
    list.appendChild(li);

    range.insertNode(list);

    // Move cursor to end of list item
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    newRange.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
}

function applyAlignment(align, range) {
    let container = range.commonAncestorContainer;

    // Find the block-level parent
    while (container && container.nodeType !== 1) {
        container = container.parentNode;
    }

    if (container) {
        const block = container.closest('p, div, h1, h2, h3, h4, h5, h6, li');
        if (block) {
            block.style.textAlign = align;
        } else {
            // Wrap in div if no block parent
            const div = document.createElement('div');
            div.style.textAlign = align;
            range.surroundContents(div);
        }
    }
}

function insertImage(src, editor) {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.margin = '10px 0';

    if (range) {
        range.insertNode(img);

        // Move cursor after image
        const newRange = document.createRange();
        newRange.setStartAfter(img);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else {
        editor.appendChild(img);
    }
}

function insertTable(editor) {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.margin = '10px 0';

    for (let i = 0; i < 2; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < 2; j++) {
            const td = document.createElement('td');
            td.style.border = '1px solid #e2e8f0';
            td.style.padding = '8px';
            td.textContent = `Cell ${i * 2 + j + 1}`;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    if (range) {
        range.insertNode(table);

        // Move cursor after table
        const newRange = document.createRange();
        newRange.setStartAfter(table);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else {
        editor.appendChild(table);
    }
}

function saveNote() {
    const editor = $('#noteEditor');
    if (!editor) return;

    const content = editor.innerHTML;
    // Here you would send to backend
    console.log('Saving note:', content);
    showNotification('Ghi chú đã được lưu!', 'success');
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== ANIMATIONS ON SCROLL =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                entry.target.style.opacity = '1';
            }
        });
    }, {
        threshold: 0.1
    });

    $$('.card, .account-group').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ===== DARK MODE TOGGLE =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);

    showNotification(
        isDark ? 'Đã bật chế độ tối' : 'Đã tắt chế độ tối',
        'info'
    );
}

// Load dark mode preference
function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initSearch();
    initCalendar();
    initNoteEditor();
    initSmoothScroll();
    initScrollAnimations();
    loadDarkMode();

    // Add fade out animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ SecureNotes App initialized successfully');
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = $('#searchInput');
        if (searchInput) searchInput.focus();
    }
});

// ===== EXPORT FUNCTIONS =====
window.SecureNotes = {
    togglePasswordVisibility,
    copyToClipboard,
    openAddAccountModal,
    openAddTaskModal,
    openAddNoteModal,
    showNotification,
    toggleTaskComplete,
    deleteTask,
    saveNote,
    toggleDarkMode
};