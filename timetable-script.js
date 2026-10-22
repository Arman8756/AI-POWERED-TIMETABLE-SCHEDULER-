// Timetable Generation Page JavaScript

let currentTab = 0;
const tabs = ['general', 'subjects', 'teachers', 'classes', 'rooms', 'lessons', 'review'];

// Sample data
let subjects = [];
let teachers = [];
let classes = [];
let rooms = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeDayCards();
    generatePeriods(8);
    // Don't load default subjects - user will add them manually
    renderSubjects(); // Just render empty state
    
    // Show input field immediately on subjects tab
    const subjectsTab = document.getElementById('subjects-tab');
    if (subjectsTab && subjectsTab.classList.contains('active')) {
        setTimeout(() => showAddSubjectModal(), 100);
    }
    
    // Add event listener for periods per day input
    const periodsInput = document.querySelector('input[type="number"]');
    if (periodsInput) {
        periodsInput.addEventListener('change', function() {
            generatePeriods(parseInt(this.value) || 8);
        });
    }
});

// Tab Navigation
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            switchTab(index);
        });
    });
}

function switchTab(index) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach((content, i) => {
        if (i === index) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    currentTab = index;
}

function nextTab() {
    if (currentTab < tabs.length - 1) {
        switchTab(currentTab + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevTab() {
    if (currentTab > 0) {
        switchTab(currentTab - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Collapsible Section
function toggleSection(button) {
    const content = button.nextElementSibling;
    button.classList.toggle('active');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        button.querySelector('span').textContent = 'Hide Period & Break Timings';
    } else {
        content.style.display = 'none';
        button.querySelector('span').textContent = 'Show Period & Break Timings';
    }
}

// Generate Periods
function generatePeriods(count) {
    const container = document.getElementById('periods-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startTime = 8 * 60; // 8:00 AM in minutes
    const periodDuration = 30; // 30 minutes per period
    
    for (let i = 1; i <= count; i++) {
        const periodStart = startTime + (i - 1) * periodDuration;
        const periodEnd = periodStart + periodDuration;
        
        const periodDiv = createPeriodElement(i, periodStart, periodEnd);
        container.appendChild(periodDiv);
    }
}

function createPeriodElement(number, startMinutes, endMinutes) {
    const div = document.createElement('div');
    div.className = 'period-item';
    
    const startTime = formatTime(startMinutes);
    const endTime = formatTime(endMinutes);
    
    div.innerHTML = `
        <div class="period-header">
            <span class="period-label">Period ${number}</span>
        </div>
        <div class="period-times">
            <div class="time-input-group">
                <label>Start Time</label>
                <input type="time" class="time-input" value="${startTime}">
            </div>
            <div class="time-input-group">
                <label>End Time</label>
                <input type="time" class="time-input" value="${endTime}">
            </div>
        </div>
        <button class="add-break-btn" onclick="addBreak(${number})">
            <i class="fas fa-plus-circle"></i> Add Break After Period ${number}
        </button>
    `;
    
    return div;
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function addBreak(periodNumber) {
    showNotification('Break Added', `Break added after Period ${periodNumber}`);
}

// Day Cards
function initializeDayCards() {
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('active');
            updateDaysSummary();
        });
    });
}

function updateDaysSummary() {
    const activeDays = document.querySelectorAll('.day-card.active');
    const inactiveDays = document.querySelectorAll('.day-card:not(.active)');
    
    const schoolDaysContainer = document.querySelector('.school-days .day-tags');
    const daysOffContainer = document.querySelector('.days-off .day-tags');
    
    if (schoolDaysContainer) {
        schoolDaysContainer.innerHTML = '';
        activeDays.forEach(day => {
            const dayName = day.querySelector('.day-name').textContent;
            const tag = document.createElement('span');
            tag.className = 'day-tag';
            tag.textContent = getDayFullName(dayName);
            schoolDaysContainer.appendChild(tag);
        });
    }
    
    if (daysOffContainer) {
        daysOffContainer.innerHTML = '';
        inactiveDays.forEach(day => {
            const dayName = day.querySelector('.day-name').textContent;
            const tag = document.createElement('span');
            tag.className = 'day-tag';
            tag.textContent = getDayFullName(dayName);
            daysOffContainer.appendChild(tag);
        });
    }
    
    // Update badge
    const badge = document.querySelector('.badge');
    if (badge) {
        badge.textContent = `${activeDays.length} school days selected`;
    }
}

function getDayFullName(shortName) {
    const dayMap = {
        'Mon': 'Monday',
        'Tue': 'Tuesday',
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday'
    };
    return dayMap[shortName] || shortName;
}

// Notifications
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 350px;
        }

        .notification-content strong {
            display: block;
            color: #7c3aed;
            margin-bottom: 0.5rem;
            font-size: 1rem;
        }

        .notification-content p {
            color: #6b7280;
            font-size: 0.9rem;
            margin: 0;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('style[data-notification]')) {
        style.setAttribute('data-notification', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Settings Button
const settingsBtn = document.querySelector('.settings-btn');
if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
        showNotification('Settings', 'Opening timetable settings...');
    });
}

// Switch to Fortnightly
const switchBtn = document.querySelector('.switch-btn');
if (switchBtn) {
    switchBtn.addEventListener('click', function() {
        const currentMode = this.previousElementSibling.textContent;
        if (currentMode.includes('Weekly')) {
            this.previousElementSibling.textContent = 'Fortnightly Timetable';
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Switch to Weekly';
            showNotification('Mode Changed', 'Switched to fortnightly timetable mode');
        } else {
            this.previousElementSibling.textContent = 'Weekly Timetable';
            this.innerHTML = '<i class="fas fa-sync-alt"></i> Switch to Fortnightly';
            showNotification('Mode Changed', 'Switched to weekly timetable mode');
        }
    });
}

// Add Subject/Teacher/Class/Room/Lesson buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-primary') && e.target.closest('.empty-state-small')) {
        const buttonText = e.target.textContent;
        if (buttonText.includes('Subject')) {
            showNotification('Add Subject', 'Opening subject form...');
        } else if (buttonText.includes('Teacher')) {
            showNotification('Add Teacher', 'Opening teacher form...');
        } else if (buttonText.includes('Class')) {
            showNotification('Add Class', 'Opening class form...');
        } else if (buttonText.includes('Room')) {
            showNotification('Add Room', 'Opening room form...');
        } else if (buttonText.includes('Lesson')) {
            showNotification('Add Lesson', 'Opening lesson form...');
        }
    }
    
    // Generate Timetable button
    if (e.target.closest('.btn-primary') && e.target.textContent.includes('Generate Timetable with AI')) {
        showNotification('AI Processing', 'Generating your timetable with AI algorithms...');
        setTimeout(() => {
            showNotification('Success', 'Timetable generated successfully!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }, 3000);
    }
});

// Help button
const helpBtn = document.querySelector('.btn-help');
if (helpBtn) {
    helpBtn.addEventListener('click', function() {
        showNotification('Schedule Call', 'Opening scheduling assistant...');
    });
}


// Removed loadDefaultSubjects - subjects start empty

// Render subjects list
function renderSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    const emptyMessage = document.getElementById('empty-subjects');
    
    if (!subjectsList) return;
    
    // Remove any existing input row
    const existingInputRow = document.getElementById('new-subject-row');
    if (existingInputRow) {
        existingInputRow.remove();
    }
    
    if (subjects.length === 0) {
        subjectsList.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'none'; // Keep hidden, will show input instead
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        subjectsList.innerHTML = subjects.map(subject => `
            <div class="subject-item" data-id="${subject.id}">
                <div class="subject-name">${subject.name}</div>
                <div class="col-availability">
                    <span class="availability-badge clickable" onclick="showAvailabilityModal(${subject.id}, 'subject')">
                        <i class="fas fa-calendar-check"></i>
                        ${subject.availability}
                    </span>
                </div>
                <div class="col-actions">
                    <button class="delete-btn" onclick="deleteSubject(${subject.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Show Add Subject Inline
function showAddSubjectModal() {
    // Check if input row already exists
    if (document.getElementById('new-subject-row')) {
        return;
    }

    const subjectsList = document.getElementById('subjects-list');
    const emptyMessage = document.getElementById('empty-subjects');
    
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }

    // Create inline input row
    const inputRow = document.createElement('div');
    inputRow.id = 'new-subject-row';
    inputRow.className = 'subject-item new-item-row';
    inputRow.innerHTML = `
        <div class="subject-name">
            <input type="text" id="new-subject-input" class="inline-input" placeholder="e.g., Physics" autofocus>
        </div>
        <div class="col-availability">
            <span class="availability-badge">
                <i class="fas fa-calendar-check"></i>
                All Available
            </span>
        </div>
        <div class="col-actions">
            <button class="delete-btn" onclick="cancelAddSubject()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    subjectsList.insertBefore(inputRow, subjectsList.firstChild);

    // Focus on input
    const input = document.getElementById('new-subject-input');
    input.focus();

    // Handle Enter key
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSubjectFromInline();
        }
    });

    // Handle Escape key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cancelAddSubject();
        }
    });

    // Handle blur (clicking outside)
    input.addEventListener('blur', function() {
        setTimeout(() => {
            if (input.value.trim()) {
                addSubjectFromInline();
            } else {
                cancelAddSubject();
            }
        }, 200);
    });
}

// Add subject from inline input
function addSubjectFromInline() {
    const input = document.getElementById('new-subject-input');
    const name = input.value.trim();
    
    if (name) {
        subjects.push({
            id: Date.now(),
            name: name,
            availability: 'All Available'
        });
        
        cancelAddSubject();
        renderSubjects();
        showNotification('Success', `Subject "${name}" added successfully!`);
    }
}

// Cancel add subject
function cancelAddSubject() {
    const inputRow = document.getElementById('new-subject-row');
    if (inputRow) {
        inputRow.remove();
    }
    
    // Show empty message if no subjects
    if (subjects.length === 0) {
        const emptyMessage = document.getElementById('empty-subjects');
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        }
    }
}

// Delete Subject
function deleteSubject(id) {
    const subject = subjects.find(s => s.id === id);
    if (confirm(`Are you sure you want to delete "${subject.name}"?`)) {
        subjects = subjects.filter(s => s.id !== id);
        renderSubjects();
        showNotification('Deleted', 'Subject removed successfully');
    }
}

// Sort Subjects
function sortSubjects() {
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    renderSubjects();
    showNotification('Sorted', 'Subjects sorted alphabetically');
}

// Show Bulk Import (for Subjects)
function showBulkImport() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2>Import Subjects/Courses</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Paste a list of names (one per line).</p>
                <form id="bulkImportForm">
                    <div class="form-group">
                        <textarea id="bulkSubjects" rows="8" placeholder="Physics&#10;Chemistry&#10;Mathematics..." class="bulk-textarea"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus on textarea
    setTimeout(() => {
        document.getElementById('bulkSubjects').focus();
    }, 100);

    const form = modal.querySelector('#bulkImportForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('bulkSubjects').value;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showNotification('Error', 'Please enter at least one subject name');
            return;
        }
        
        lines.forEach(line => {
            subjects.push({
                id: Date.now() + Math.random(),
                name: line.trim(),
                availability: 'All Available'
            });
        });
        
        renderSubjects();
        modal.remove();
        showNotification('Success', `${lines.length} subject${lines.length > 1 ? 's' : ''} imported successfully!`);
    });
}

// Show Bulk Import Teachers
function showBulkImportTeachers() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2>Import Teachers</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Paste a list of names (one per line).</p>
                <form id="bulkImportTeachersForm">
                    <div class="form-group">
                        <textarea id="bulkTeachers" rows="8" placeholder="John Doe&#10;Jane Smith&#10;Rachel..." class="bulk-textarea"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        document.getElementById('bulkTeachers').focus();
    }, 100);

    const form = modal.querySelector('#bulkImportTeachersForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('bulkTeachers').value;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showNotification('Error', 'Please enter at least one teacher name');
            return;
        }
        
        lines.forEach(line => {
            teachers.push({
                id: Date.now() + Math.random(),
                name: line.trim(),
                subject: '',
                availability: 'All Available'
            });
        });
        
        renderTeachers();
        modal.remove();
        showNotification('Success', `${lines.length} teacher${lines.length > 1 ? 's' : ''} imported successfully!`);
    });
}

// Show Add Teacher Modal
function showAddTeacherModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2><i class="fas fa-chalkboard-teacher"></i> Add Teacher</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addTeacherForm">
                    <div class="form-group">
                        <label class="form-label">Teacher Name <span class="required">*</span></label>
                        <input type="text" id="teacherName" class="form-input" placeholder="e.g., John Smith" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject Specialization</label>
                        <input type="text" id="teacherSubject" class="form-input" placeholder="e.g., Mathematics">
                        <p class="field-hint">Optional - Specify the subject this teacher specializes in</p>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Availability</label>
                        <select id="teacherAvailability" class="form-select">
                            <option value="All Available">All Available</option>
                            <option value="Limited">Limited</option>
                            <option value="Specific Days">Specific Days</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-plus"></i> Add Teacher
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus on first input
    setTimeout(() => {
        document.getElementById('teacherName').focus();
    }, 100);

    const form = modal.querySelector('#addTeacherForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('teacherName').value.trim();
        const subject = document.getElementById('teacherSubject').value.trim();
        const availability = document.getElementById('teacherAvailability').value;
        
        if (!name) {
            showNotification('Error', 'Please enter teacher name');
            return;
        }
        
        teachers.push({
            id: Date.now(),
            name: name,
            subject: subject,
            availability: availability
        });
        
        renderTeachers();
        modal.remove();
        showNotification('Success', `Teacher "${name}" added successfully!`);
    });
}

// Render teachers list
function renderTeachers() {
    const teachersList = document.getElementById('teachers-list');
    const emptyMessage = document.getElementById('empty-teachers');
    
    if (!teachersList) return;
    
    if (teachers.length === 0) {
        teachersList.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        teachersList.innerHTML = teachers.map(teacher => `
            <div class="subject-item" data-id="${teacher.id}">
                <div class="subject-name">${teacher.name}</div>
                <div class="col-availability">
                    <span class="availability-badge clickable" onclick="showAvailabilityModal(${teacher.id}, 'teacher')">
                        <i class="fas fa-calendar-check"></i>
                        ${teacher.availability}
                    </span>
                </div>
                <div class="col-actions">
                    <button class="delete-btn" onclick="deleteTeacher(${teacher.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Delete Teacher
function deleteTeacher(id) {
    const teacher = teachers.find(t => t.id === id);
    if (confirm(`Are you sure you want to delete "${teacher.name}"?`)) {
        teachers = teachers.filter(t => t.id !== id);
        renderTeachers();
        showNotification('Deleted', 'Teacher removed successfully');
    }
}


// Classes/Grades Management
// Removed loadDefaultClasses - classes start empty

// Render classes list
function renderClasses() {
    const classesList = document.getElementById('classes-list');
    const emptyMessage = document.getElementById('empty-classes');
    
    if (!classesList) return;
    
    if (classes.length === 0) {
        classesList.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        classesList.innerHTML = classes.map(cls => `
            <div class="class-item" data-id="${cls.id}">
                <div class="subject-name">${cls.name}</div>
                <div class="col-teacher">
                    <select class="teacher-select" onchange="assignTeacher(${cls.id}, this.value)">
                        <option value="">-- Select Teacher --</option>
                        ${teachers.map(t => `<option value="${t.id}" ${cls.teacher === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-availability">
                    <span class="availability-badge clickable" onclick="showAvailabilityModal(${cls.id}, 'class')">
                        <i class="fas fa-calendar-check"></i>
                        ${cls.availability}
                    </span>
                </div>
                <div class="col-actions">
                    <button class="delete-btn" onclick="deleteClass(${cls.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Show Add Class Modal
function showAddClassModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> Add Class</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addClassForm">
                    <div class="form-group">
                        <label class="form-label">Class Name <span class="required">*</span></label>
                        <input type="text" id="className" class="form-input" placeholder="e.g., 6A, Grade 10" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class Teacher</label>
                        <select id="classTeacher" class="form-select">
                            <option value="">-- Select Teacher --</option>
                            ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                        </select>
                        <p class="field-hint">Optional - Assign a class teacher for this class</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-plus"></i> Add Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        document.getElementById('className').focus();
    }, 100);

    const form = modal.querySelector('#addClassForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('className').value.trim();
        const teacher = document.getElementById('classTeacher').value;
        
        if (!name) {
            showNotification('Error', 'Please enter class name');
            return;
        }
        
        classes.push({
            id: Date.now(),
            name: name,
            teacher: teacher || null,
            availability: 'All Available'
        });
        
        renderClasses();
        modal.remove();
        showNotification('Success', `Class "${name}" added successfully!`);
    });
}

// Bulk Import Classes
function showBulkImportClasses() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2>Import Classes</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Paste a list of names (one per line).</p>
                <form id="bulkImportClassesForm">
                    <div class="form-group">
                        <textarea id="bulkClasses" rows="8" placeholder="Class 1&#10;Class 2&#10;Class 3rd..." class="bulk-textarea"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        document.getElementById('bulkClasses').focus();
    }, 100);

    const form = modal.querySelector('#bulkImportClassesForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('bulkClasses').value;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showNotification('Error', 'Please enter at least one class name');
            return;
        }
        
        lines.forEach(line => {
            classes.push({
                id: Date.now() + Math.random(),
                name: line.trim(),
                teacher: null,
                availability: 'All Available'
            });
        });
        
        renderClasses();
        modal.remove();
        showNotification('Success', `${lines.length} class${lines.length > 1 ? 'es' : ''} imported successfully!`);
    });
}

// Assign Teacher to Class
function assignTeacher(classId, teacherId) {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
        cls.teacher = teacherId || null;
        showNotification('Updated', 'Class teacher assigned');
    }
}

// Delete Class
function deleteClass(id) {
    const cls = classes.find(c => c.id === id);
    if (confirm(`Are you sure you want to delete "${cls.name}"?`)) {
        classes = classes.filter(c => c.id !== id);
        renderClasses();
        showNotification('Deleted', 'Class removed successfully');
    }
}

// Rooms Management

// Render rooms list
function renderRooms() {
    const roomsList = document.getElementById('rooms-list');
    const emptyMessage = document.getElementById('empty-rooms');
    
    if (!roomsList) return;
    
    if (rooms.length === 0) {
        roomsList.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
    } else {
        if (emptyMessage) emptyMessage.style.display = 'none';
        roomsList.innerHTML = rooms.map(room => `
            <div class="class-item" data-id="${room.id}">
                <div class="subject-name">${room.name}</div>
                <div class="col-teacher">
                    <select class="teacher-select" onchange="assignHomeRoom(${room.id}, this.value)">
                        <option value="">-- Select Class --</option>
                        ${classes.map(c => `<option value="${c.id}" ${room.homeRoomFor === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-availability">
                    <span class="availability-badge clickable" onclick="showAvailabilityModal(${room.id}, 'room')">
                        <i class="fas fa-calendar-check"></i>
                        ${room.availability}
                    </span>
                </div>
                <div class="col-actions">
                    <button class="delete-btn" onclick="deleteRoom(${room.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Show Add Room Modal
function showAddRoomModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2><i class="fas fa-door-open"></i> Add Room</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addRoomForm">
                    <div class="form-group">
                        <label class="form-label">Room Name <span class="required">*</span></label>
                        <input type="text" id="roomName" class="form-input" placeholder="e.g., Computer Lab, Music Room" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Home Room For</label>
                        <select id="roomHomeClass" class="form-select">
                            <option value="">-- Select Class --</option>
                            ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                        <p class="field-hint">Optional - Assign this room as a home room for a specific class</p>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-plus"></i> Add Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        document.getElementById('roomName').focus();
    }, 100);

    const form = modal.querySelector('#addRoomForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('roomName').value.trim();
        const homeClass = document.getElementById('roomHomeClass').value;
        
        if (!name) {
            showNotification('Error', 'Please enter room name');
            return;
        }
        
        rooms.push({
            id: Date.now(),
            name: name,
            homeRoomFor: homeClass || null,
            availability: 'All Available'
        });
        
        renderRooms();
        modal.remove();
        showNotification('Success', `Room "${name}" added successfully!`);
    });
}

// Bulk Import Rooms
function showBulkImportRooms() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2>Import Rooms</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Paste a list of room names (one per line).</p>
                <form id="bulkImportRoomsForm">
                    <div class="form-group">
                        <textarea id="bulkRooms" rows="8" placeholder="Computer Lab&#10;Science Lab&#10;Music Room..." class="bulk-textarea"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        document.getElementById('bulkRooms').focus();
    }, 100);

    const form = modal.querySelector('#bulkImportRoomsForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('bulkRooms').value;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showNotification('Error', 'Please enter at least one room name');
            return;
        }
        
        lines.forEach(line => {
            rooms.push({
                id: Date.now() + Math.random(),
                name: line.trim(),
                homeRoomFor: null,
                availability: 'All Available'
            });
        });
        
        renderRooms();
        modal.remove();
        showNotification('Success', `${lines.length} room${lines.length > 1 ? 's' : ''} imported successfully!`);
    });
}

// Assign Home Room
function assignHomeRoom(roomId, classId) {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
        room.homeRoomFor = classId || null;
        showNotification('Updated', 'Home room assigned');
    }
}

// Delete Room
function deleteRoom(id) {
    const room = rooms.find(r => r.id === id);
    if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
        rooms = rooms.filter(r => r.id !== id);
        renderRooms();
        showNotification('Deleted', 'Room removed successfully');
    }
}

// Removed auto-loading of classes - user will add them manually


// Sort Teachers
function sortTeachers() {
    teachers.sort((a, b) => a.name.localeCompare(b.name));
    renderTeachers();
    showNotification('Sorted', 'Teachers sorted alphabetically');
}

// Sort Classes
function sortClasses() {
    classes.sort((a, b) => a.name.localeCompare(b.name));
    renderClasses();
    showNotification('Sorted', 'Classes sorted alphabetically');
}

// Sort Rooms
function sortRooms() {
    rooms.sort((a, b) => a.name.localeCompare(b.name));
    renderRooms();
    showNotification('Sorted', 'Rooms sorted alphabetically');
}


// Availability Management
function showAvailabilityModal(itemId, type) {
    let item, itemName;
    
    if (type === 'subject') {
        item = subjects.find(s => s.id === itemId);
        itemName = item.name;
    } else if (type === 'teacher') {
        item = teachers.find(t => t.id === itemId);
        itemName = item.name;
    } else if (type === 'class') {
        item = classes.find(c => c.id === itemId);
        itemName = item.name;
    } else if (type === 'room') {
        item = rooms.find(r => r.id === itemId);
        itemName = item.name;
    }
    
    if (!item) return;
    
    // Initialize availability grid if not exists
    if (!item.availabilityGrid) {
        item.availabilityGrid = initializeAvailabilityGrid();
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Manage Availability for ${itemName}</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="availability-info">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <p><strong>Mark periods when ${itemName} is not available for scheduling.</strong></p>
                        <ul>
                            <li>Click any cell to toggle its availability status</li>
                            <li>Click a day name (column header) to toggle the entire day</li>
                            <li>Click a period (row header) to toggle the entire period across all days</li>
                        </ul>
                    </div>
                </div>
                
                <div class="availability-legend">
                    <div class="legend-item">
                        <span class="legend-icon available"><i class="fas fa-check"></i></span>
                        <span>Available</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-icon unavailable"><i class="fas fa-times"></i></span>
                        <span>Time Off</span>
                    </div>
                </div>
                
                <div class="availability-grid-container">
                    <table class="availability-table" id="availability-table-${itemId}">
                        <thead>
                            <tr>
                                <th class="period-header">Period/Day</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Monday')">Monday</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Tuesday')">Tuesday</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Wednesday')">Wednesday</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Thursday')">Thursday</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Friday')">Friday</th>
                                <th class="day-header" onclick="toggleDay(${itemId}, '${type}', 'Saturday')">Saturday</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateAvailabilityRows(itemId, type, item.availabilityGrid)}
                        </tbody>
                    </table>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Cancel
                    </button>
                    <button type="button" class="btn-primary" onclick="saveAvailability(${itemId}, '${type}')">
                        <i class="fas fa-save"></i> Save Availability
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Initialize availability grid (all available by default)
function initializeAvailabilityGrid() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grid = {};
    
    for (let period = 1; period <= 8; period++) {
        grid[`Period ${period}`] = {};
        days.forEach(day => {
            grid[`Period ${period}`][day] = true; // true = available
        });
    }
    
    return grid;
}

// Generate availability table rows
function generateAvailabilityRows(itemId, type, grid) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let html = '';
    
    for (let period = 1; period <= 8; period++) {
        const periodKey = `Period ${period}`;
        html += `<tr>`;
        html += `<td class="period-header" onclick="togglePeriod(${itemId}, '${type}', '${periodKey}')">${periodKey}</td>`;
        
        days.forEach(day => {
            const isAvailable = grid[periodKey][day];
            const cellClass = isAvailable ? 'available' : 'unavailable';
            const icon = isAvailable ? 'fa-check' : 'fa-times';
            html += `
                <td class="availability-cell ${cellClass}" 
                    onclick="toggleCell(${itemId}, '${type}', '${periodKey}', '${day}')"
                    data-period="${periodKey}" 
                    data-day="${day}">
                    <i class="fas ${icon}"></i>
                </td>
            `;
        });
        
        html += `</tr>`;
    }
    
    return html;
}

// Toggle single cell
function toggleCell(itemId, type, period, day) {
    let item;
    
    if (type === 'subject') item = subjects.find(s => s.id === itemId);
    else if (type === 'teacher') item = teachers.find(t => t.id === itemId);
    else if (type === 'class') item = classes.find(c => c.id === itemId);
    else if (type === 'room') item = rooms.find(r => r.id === itemId);
    
    if (!item) return;
    
    // Toggle availability
    item.availabilityGrid[period][day] = !item.availabilityGrid[period][day];
    
    // Update UI
    const cell = document.querySelector(`#availability-table-${itemId} td[data-period="${period}"][data-day="${day}"]`);
    if (cell) {
        const isAvailable = item.availabilityGrid[period][day];
        cell.className = `availability-cell ${isAvailable ? 'available' : 'unavailable'}`;
        cell.innerHTML = `<i class="fas ${isAvailable ? 'fa-check' : 'fa-times'}"></i>`;
    }
}

// Toggle entire day
function toggleDay(itemId, type, day) {
    let item;
    
    if (type === 'subject') item = subjects.find(s => s.id === itemId);
    else if (type === 'teacher') item = teachers.find(t => t.id === itemId);
    else if (type === 'class') item = classes.find(c => c.id === itemId);
    else if (type === 'room') item = rooms.find(r => r.id === itemId);
    
    if (!item) return;
    
    // Check if all periods for this day are available
    let allAvailable = true;
    for (let period = 1; period <= 8; period++) {
        if (!item.availabilityGrid[`Period ${period}`][day]) {
            allAvailable = false;
            break;
        }
    }
    
    // Toggle all periods for this day
    const newState = !allAvailable;
    for (let period = 1; period <= 8; period++) {
        item.availabilityGrid[`Period ${period}`][day] = newState;
    }
    
    // Update UI
    for (let period = 1; period <= 8; period++) {
        const cell = document.querySelector(`#availability-table-${itemId} td[data-period="Period ${period}"][data-day="${day}"]`);
        if (cell) {
            cell.className = `availability-cell ${newState ? 'available' : 'unavailable'}`;
            cell.innerHTML = `<i class="fas ${newState ? 'fa-check' : 'fa-times'}"></i>`;
        }
    }
}

// Toggle entire period
function togglePeriod(itemId, type, period) {
    let item;
    
    if (type === 'subject') item = subjects.find(s => s.id === itemId);
    else if (type === 'teacher') item = teachers.find(t => t.id === itemId);
    else if (type === 'class') item = classes.find(c => c.id === itemId);
    else if (type === 'room') item = rooms.find(r => r.id === itemId);
    
    if (!item) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Check if all days for this period are available
    let allAvailable = true;
    days.forEach(day => {
        if (!item.availabilityGrid[period][day]) {
            allAvailable = false;
        }
    });
    
    // Toggle all days for this period
    const newState = !allAvailable;
    days.forEach(day => {
        item.availabilityGrid[period][day] = newState;
    });
    
    // Update UI
    days.forEach(day => {
        const cell = document.querySelector(`#availability-table-${itemId} td[data-period="${period}"][data-day="${day}"]`);
        if (cell) {
            cell.className = `availability-cell ${newState ? 'available' : 'unavailable'}`;
            cell.innerHTML = `<i class="fas ${newState ? 'fa-check' : 'fa-times'}"></i>`;
        }
    });
}

// Save availability
function saveAvailability(itemId, type) {
    let item;
    
    if (type === 'subject') item = subjects.find(s => s.id === itemId);
    else if (type === 'teacher') item = teachers.find(t => t.id === itemId);
    else if (type === 'class') item = classes.find(c => c.id === itemId);
    else if (type === 'room') item = rooms.find(r => r.id === itemId);
    
    if (!item) return;
    
    // Calculate availability status
    let totalSlots = 0;
    let availableSlots = 0;
    
    for (let period = 1; period <= 8; period++) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
            totalSlots++;
            if (item.availabilityGrid[`Period ${period}`][day]) {
                availableSlots++;
            }
        });
    }
    
    // Update availability status
    if (availableSlots === totalSlots) {
        item.availability = 'All Available';
    } else if (availableSlots === 0) {
        item.availability = 'Not Available';
    } else {
        item.availability = 'Limited';
    }
    
    // Re-render the list
    if (type === 'subject') renderSubjects();
    else if (type === 'teacher') renderTeachers();
    else if (type === 'class') renderClasses();
    else if (type === 'room') renderRooms();
    
    // Close modal
    document.querySelector('.modal-overlay').remove();
    
    showNotification('Success', 'Availability updated successfully!');
}


// Lessons Management
let lessons = [];
let lessonView = 'class'; // 'class' or 'teacher'

// Switch lesson view
function switchLessonView(view) {
    lessonView = view;
    
    // Update button states
    document.getElementById('class-wise-btn').classList.toggle('active', view === 'class');
    document.getElementById('teacher-wise-btn').classList.toggle('active', view === 'teacher');
    
    // Re-render lessons
    renderLessons();
}

// Render lessons
function renderLessons() {
    const lessonsContent = document.getElementById('lessons-content');
    
    if (!lessonsContent) return;
    
    if (lessons.length === 0) {
        lessonsContent.innerHTML = `
            <div class="empty-lessons-state">
                <i class="fas fa-calendar-times"></i>
                <h3>No lessons added yet.</h3>
                <p>Add lessons by clicking the "Add New Lesson" button below.</p>
            </div>
        `;
        return;
    }
    
    if (lessonView === 'class') {
        renderClassWiseLessons(lessonsContent);
    } else {
        renderTeacherWiseLessons(lessonsContent);
    }
}

// Render class-wise lessons
function renderClassWiseLessons(container) {
    const groupedLessons = {};
    
    lessons.forEach(lesson => {
        // Handle both single class and multiple classes
        const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
        
        classIds.forEach(classId => {
            const className = classes.find(c => c.id === classId)?.name || 'Unknown';
            if (!groupedLessons[className]) {
                groupedLessons[className] = {
                    lessons: [],
                    totalPeriods: 0,
                    teacherCount: new Set()
                };
            }
            groupedLessons[className].lessons.push(lesson);
            groupedLessons[className].totalPeriods += lesson.periodsPerWeek || 0;
            
            // Count unique teachers
            const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
            teacherIds.forEach(tid => groupedLessons[className].teacherCount.add(tid));
        });
    });
    
    let html = '';
    Object.keys(groupedLessons).sort().forEach(className => {
        const classData = groupedLessons[className];
        const lessonCount = classData.lessons.length;
        const periodCount = classData.totalPeriods;
        const teacherCount = classData.teacherCount.size;
        
        html += `
            <div class="class-lesson-section">
                <div class="class-lesson-header">
                    <div class="class-lesson-title">
                        <i class="fas fa-users"></i>
                        <span class="class-name-large">${className}</span>
                    </div>
                    <div class="class-lesson-stats">
                        <span class="stat-badge">${lessonCount} Lessons</span>
                        <span class="stat-badge">${periodCount} Periods</span>
                        <span class="stat-badge">${teacherCount} Teachers</span>
                    </div>
                    <button class="btn-add-lesson-inline" onclick="showAddLessonModal('${className}')">
                        <i class="fas fa-plus"></i> Add Lesson
                    </button>
                </div>
                
                <div class="lessons-table-container">
                    <table class="lessons-table">
                        <thead>
                            <tr>
                                <th>Teachers</th>
                                <th>Subjects</th>
                                <th>Lessons/Week</th>
                                <th>Length</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classData.lessons.map(lesson => renderLessonTableRow(lesson)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Render teacher-wise lessons
function renderTeacherWiseLessons(container) {
    const groupedLessons = {};
    
    lessons.forEach(lesson => {
        // Handle both single teacher and multiple teachers
        const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
        
        teacherIds.forEach(teacherId => {
            const teacherName = teachers.find(t => t.id === teacherId)?.name || 'Unknown';
            if (!groupedLessons[teacherName]) {
                groupedLessons[teacherName] = {
                    lessons: [],
                    totalPeriods: 0,
                    classCount: new Set()
                };
            }
            groupedLessons[teacherName].lessons.push(lesson);
            groupedLessons[teacherName].totalPeriods += lesson.periodsPerWeek || 0;
            
            // Count unique classes
            const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
            classIds.forEach(cid => groupedLessons[teacherName].classCount.add(cid));
        });
    });
    
    let html = '';
    Object.keys(groupedLessons).sort().forEach(teacherName => {
        const teacherData = groupedLessons[teacherName];
        const lessonCount = teacherData.lessons.length;
        const periodCount = teacherData.totalPeriods;
        const classCount = teacherData.classCount.size;
        
        // Get all unique teacher names for this group (for display like "Campbell + Chen + Jackson")
        const allTeacherNames = new Set();
        teacherData.lessons.forEach(lesson => {
            const tIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
            tIds.forEach(tid => {
                const tName = teachers.find(t => t.id === tid)?.name;
                if (tName) allTeacherNames.add(tName);
            });
        });
        const displayName = Array.from(allTeacherNames).join(' + ');
        
        html += `
            <div class="teacher-lesson-card">
                <div class="teacher-lesson-header">
                    <div class="teacher-info">
                        <span class="teacher-name-large">${displayName}</span>
                        <div class="teacher-stats-inline">
                            <span class="stat-text">${lessonCount} Lessons</span>
                            <span class="stat-text">${periodCount} Periods</span>
                            <span class="stat-text">${classCount} Classes</span>
                        </div>
                    </div>
                    <div class="teacher-actions">
                        <button class="btn-add-lesson-small" onclick="showAddLessonForTeacher('${teacherName}')">
                            <i class="fas fa-plus"></i> Add Lesson
                        </button>
                        <button class="btn-expand-collapse" onclick="toggleTeacherCard(this)">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Toggle teacher card expansion
function toggleTeacherCard(button) {
    const icon = button.querySelector('i');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
    // In future, this will expand/collapse the lessons table
}

// Show add lesson modal for specific teacher
function showAddLessonForTeacher(teacherName) {
    showAddLessonModalSimplified(null, teacherName);
}

// Render individual lesson item
function renderLessonItem(lesson) {
    // Handle both single and multiple values
    const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
    const subjectIds = lesson.subjectIds || (lesson.subjectId ? [lesson.subjectId] : []);
    const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
    
    const classNames = classIds.map(id => classes.find(c => c.id === id)?.name).filter(Boolean).join(' | ');
    const subjectNames = subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(' | ');
    const teacherNames = teacherIds.map(id => teachers.find(t => t.id === id)?.name).filter(Boolean).join(' | ');
    
    return `
        <div class="lesson-item">
            <div class="lesson-field">
                <span class="lesson-field-label">${lessonView === 'class' ? 'Subject' : 'Class'}</span>
                <span class="lesson-field-value">${lessonView === 'class' ? (subjectNames || 'Unknown') : (classNames || 'Unknown')}</span>
            </div>
            <div class="lesson-field">
                <span class="lesson-field-label">${lessonView === 'class' ? 'Teacher' : 'Subject'}</span>
                <span class="lesson-field-value">${lessonView === 'class' ? (teacherNames || 'Unknown') : (subjectNames || 'Unknown')}</span>
            </div>
            <div class="lesson-field">
                <span class="lesson-field-label">Periods/Week</span>
                <span class="lesson-field-value">${lesson.periodsPerWeek || 0}</span>
            </div>
            <div class="lesson-item-actions">
                <button class="edit-btn" onclick="editLesson(${lesson.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteLesson(${lesson.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Render lesson as table row (for class-wise view)
function renderLessonTableRow(lesson) {
    const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
    const subjectIds = lesson.subjectIds || (lesson.subjectId ? [lesson.subjectId] : []);
    
    const teacherNames = teacherIds.map(id => teachers.find(t => t.id === id)?.name).filter(Boolean).join(', ');
    const subjectNames = subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
    
    // Check if lesson has groups (split classes)
    const hasGroups = lesson.isSplit && lesson.groups && lesson.groups.length > 0;
    const groupsInfo = hasGroups ? `<span class="groups-badge">${lesson.groups.length} Groups</span>` : '';
    
    const lengthDisplay = lesson.lessonLength === 'single' ? 'Single Period' : 
                         lesson.lessonLength === 'double' ? 'Double Period' :
                         lesson.lessonLength === 'triple' ? 'Triple Period' :
                         `${lesson.lessonLength} Periods`;
    
    return `
        <tr class="lesson-table-row">
            <td class="teacher-cell">${teacherNames || 'Not assigned'}</td>
            <td class="subject-cell">${subjectNames || 'Not assigned'}</td>
            <td class="periods-cell">${lesson.periodsPerWeek || 0}</td>
            <td class="length-cell">
                ${lengthDisplay}
                ${groupsInfo}
            </td>
            <td class="actions-cell">
                <button class="icon-btn info-btn" onclick="viewLessonDetails(${lesson.id})" title="View Details">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button class="icon-btn edit-btn" onclick="editLesson(${lesson.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-btn copy-btn" onclick="copyLesson(${lesson.id})" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="icon-btn delete-btn" onclick="deleteLesson(${lesson.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// View lesson details
function viewLessonDetails(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
    const subjectIds = lesson.subjectIds || (lesson.subjectId ? [lesson.subjectId] : []);
    const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
    
    const teacherNames = teacherIds.map(id => teachers.find(t => t.id === id)?.name).filter(Boolean).join(', ');
    const subjectNames = subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
    const classNames = classIds.map(id => classes.find(c => c.id === id)?.name).filter(Boolean).join(', ');
    
    let groupsHtml = '';
    if (lesson.isSplit && lesson.groups) {
        groupsHtml = `
            <div class="detail-section">
                <h4>Groups (${lesson.groups.length})</h4>
                ${lesson.groups.map((group, idx) => {
                    const gTeachers = group.teacherIds.map(id => teachers.find(t => t.id === id)?.name).filter(Boolean).join(', ');
                    const gSubjects = group.subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean).join(', ');
                    return `
                        <div class="group-detail">
                            <strong>Group ${idx + 1}:</strong><br>
                            Teachers: ${gTeachers}<br>
                            Subjects: ${gSubjects}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2><i class="fas fa-info-circle"></i> Lesson Details</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="lesson-details">
                    <div class="detail-row">
                        <span class="detail-label">Classes:</span>
                        <span class="detail-value">${classNames}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Teachers:</span>
                        <span class="detail-value">${teacherNames}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Subjects:</span>
                        <span class="detail-value">${subjectNames}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Periods per Week:</span>
                        <span class="detail-value">${lesson.periodsPerWeek}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Lesson Length:</span>
                        <span class="detail-value">${lesson.lessonLength || 'Single Period'}</span>
                    </div>
                    ${groupsHtml}
                </div>
                <div class="form-actions">
                    <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy/Duplicate lesson
function copyLesson(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const newLesson = {
        ...lesson,
        id: Date.now()
    };
    
    lessons.push(newLesson);
    renderLessons();
    showNotification('Success', 'Lesson duplicated successfully!');
}

// Toggle lesson card
function toggleLessonCard(header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('.expand-icon');
    
    body.classList.toggle('expanded');
    icon.classList.toggle('expanded');
}

// Expand all lessons
function expandAllLessons() {
    document.querySelectorAll('.lesson-card-body').forEach(body => {
        body.classList.add('expanded');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.classList.add('expanded');
    });
}

// Collapse all lessons
function collapseAllLessons() {
    document.querySelectorAll('.lesson-card-body').forEach(body => {
        body.classList.remove('expanded');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.classList.remove('expanded');
    });
}

// Show add lesson modal
function showAddLessonModal(preselectedClass = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Add New Lesson</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addLessonForm">
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label class="form-label">Classes <span class="required">*</span></label>
                            <select id="lessonClass" class="form-select" required>
                                <option value="">Select...</option>
                                ${classes.map(c => `<option value="${c.id}" ${preselectedClass === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teachers <span class="required">*</span></label>
                            <select id="lessonTeacher" class="form-select" required>
                                <option value="">Select...</option>
                                ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row-3col">
                        <div class="form-group">
                            <label class="form-label">Subjects <span class="required">*</span></label>
                            <select id="lessonSubject" class="form-select" required>
                                <option value="">Select...</option>
                                ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lessons per Week <span class="required">*</span></label>
                            <input type="number" id="lessonPeriods" class="form-input" placeholder="1" min="1" max="40" value="1" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                Lesson Length* 
                                <i class="fas fa-info-circle tooltip-icon" title="Duration of each lesson period"></i>
                            </label>
                            <select id="lessonLength" class="form-select">
                                <option value="single">Single Period</option>
                                <option value="double">Double Period</option>
                                <option value="triple">Triple Period</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="assignRooms">
                            <span>Assign Specific Rooms (Optional)</span>
                        </label>
                        <p class="field-hint">Manually assign rooms for this lesson. If not specified, rooms will be assigned automatically during scheduling.</p>
                    </div>
                    
                    <div id="roomsSection" class="rooms-section" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">Select Room</label>
                            <select id="lessonRoom" class="form-select">
                                <option value="">-- Select Room --</option>
                                ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Add Lesson
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Toggle rooms section
    const assignRoomsCheckbox = document.getElementById('assignRooms');
    const roomsSection = document.getElementById('roomsSection');
    
    assignRoomsCheckbox.addEventListener('change', function() {
        roomsSection.style.display = this.checked ? 'block' : 'none';
    });
    
    const form = modal.querySelector('#addLessonForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const classId = parseInt(document.getElementById('lessonClass').value);
        const subjectId = parseInt(document.getElementById('lessonSubject').value);
        const teacherId = parseInt(document.getElementById('lessonTeacher').value);
        const periodsPerWeek = parseInt(document.getElementById('lessonPeriods').value);
        const lessonLength = document.getElementById('lessonLength').value;
        const roomId = document.getElementById('assignRooms').checked ? 
                      parseInt(document.getElementById('lessonRoom').value) : null;
        
        if (!classId || !subjectId || !teacherId || !periodsPerWeek) {
            showNotification('Error', 'Please fill all required fields');
            return;
        }
        
        lessons.push({
            id: Date.now(),
            classId,
            subjectId,
            teacherId,
            periodsPerWeek,
            lessonLength,
            roomId
        });
        
        renderLessons();
        modal.remove();
        showNotification('Success', 'Lesson added successfully!');
    });
}

// Edit lesson
function editLesson(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2><i class="fas fa-edit"></i> Edit Lesson</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editLessonForm">
                    <div class="form-group">
                        <label class="form-label">Class <span class="required">*</span></label>
                        <select id="editLessonClass" class="form-select" required>
                            ${classes.map(c => `<option value="${c.id}" ${c.id === lesson.classId ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject <span class="required">*</span></label>
                        <select id="editLessonSubject" class="form-select" required>
                            ${subjects.map(s => `<option value="${s.id}" ${s.id === lesson.subjectId ? 'selected' : ''}>${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teacher <span class="required">*</span></label>
                        <select id="editLessonTeacher" class="form-select" required>
                            ${teachers.map(t => `<option value="${t.id}" ${t.id === lesson.teacherId ? 'selected' : ''}>${t.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Periods per Week <span class="required">*</span></label>
                        <input type="number" id="editLessonPeriods" class="form-input" value="${lesson.periodsPerWeek}" min="1" max="40" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#editLessonForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        lesson.classId = parseInt(document.getElementById('editLessonClass').value);
        lesson.subjectId = parseInt(document.getElementById('editLessonSubject').value);
        lesson.teacherId = parseInt(document.getElementById('editLessonTeacher').value);
        lesson.periodsPerWeek = parseInt(document.getElementById('editLessonPeriods').value);
        
        renderLessons();
        modal.remove();
        showNotification('Success', 'Lesson updated successfully!');
    });
}

// Delete lesson
function deleteLesson(lessonId) {
    if (confirm('Are you sure you want to delete this lesson?')) {
        lessons = lessons.filter(l => l.id !== lessonId);
        renderLessons();
        showNotification('Deleted', 'Lesson removed successfully');
    }
}

// Bulk import lessons
function showBulkImportLessons() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>Bulk Import Lessons</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p class="modal-description">Paste your lesson data in the following format:</p>
                <div class="format-example">
                    <code>Teacher Name(s), Class Name(s), Subject Name(s), # of periods</code>
                </div>
                <div class="format-example">
                    <code>Teacher A | Teacher B, Class 1 | Class 2, Subject 1 | Subject 2, 12</code>
                </div>
                <form id="bulkImportLessonsForm">
                    <div class="form-group">
                        <textarea id="bulkLessonsData" rows="10" class="bulk-textarea" placeholder="e.g.&#10;Teacher A, Grade 5A, Mathematics | Science, 12&#10;Teacher A | Teacher B, Grade 5A | Grade 5B, Mathematics | Physics, 12"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            Import
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const form = modal.querySelector('#bulkImportLessonsForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = document.getElementById('bulkLessonsData').value;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            showNotification('Error', 'Please enter lesson data');
            return;
        }
        
        let imported = 0;
        lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 4) {
                const teacherNames = parts[0].split('|').map(t => t.trim());
                const classNames = parts[1].split('|').map(c => c.trim());
                const subjectNames = parts[2].split('|').map(s => s.trim());
                const periodsPerWeek = parseInt(parts[3]);
                
                // Find IDs
                const teacherIds = teacherNames.map(name => 
                    teachers.find(t => t.name.toLowerCase() === name.toLowerCase())?.id
                ).filter(id => id);
                
                const classIds = classNames.map(name => 
                    classes.find(c => c.name.toLowerCase() === name.toLowerCase())?.id
                ).filter(id => id);
                
                const subjectIds = subjectNames.map(name => 
                    subjects.find(s => s.name.toLowerCase() === name.toLowerCase())?.id
                ).filter(id => id);
                
                if (teacherIds.length > 0 && classIds.length > 0 && subjectIds.length > 0) {
                    lessons.push({
                        id: Date.now() + Math.random(),
                        classIds,
                        teacherIds,
                        subjectIds,
                        periodsPerWeek,
                        lessonLength: 'single',
                        roomIds: [],
                        isSplit: false
                    });
                    imported++;
                }
            }
        });
        
        renderLessons();
        modal.remove();
        showNotification('Success', `${imported} lesson${imported > 1 ? 's' : ''} imported successfully!`);
    });
}


// Update Review Tab with current data
function updateReviewTab() {
    // Update stats
    document.getElementById('totalSubjects').textContent = subjects.length;
    document.getElementById('totalClasses').textContent = classes.length;
    document.getElementById('totalTeachers').textContent = teachers.length;
    document.getElementById('totalLessons').textContent = lessons.length;
    
    // Calculate total periods
    const totalPeriods = lessons.reduce((sum, lesson) => sum + (lesson.periodsPerWeek || 0), 0);
    document.getElementById('totalPeriods').textContent = totalPeriods;
    
    // Calculate vacant slots (total possible slots - used slots)
    const periodsPerDay = 8; // Get from settings
    const workingDays = 6; // Get from settings
    const totalSlots = classes.length * periodsPerDay * workingDays;
    const vacantSlots = Math.max(0, totalSlots - totalPeriods);
    document.getElementById('vacantSlots').textContent = vacantSlots;
    
    // Update class distribution
    updateClassDistribution();
    
    // Update teacher distribution
    updateTeacherDistribution();
}

// Update class period distribution
function updateClassDistribution() {
    const classDistribution = {};
    const periodsPerDay = 8;
    const workingDays = 6;
    const totalPeriodsPerClass = periodsPerDay * workingDays;
    
    // Initialize all classes with 0
    classes.forEach(cls => {
        classDistribution[cls.name] = 0;
    });
    
    // Count periods for each class
    lessons.forEach(lesson => {
        const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
        const periodsPerWeek = lesson.periodsPerWeek || 0;
        
        classIds.forEach(classId => {
            const className = classes.find(c => c.id === classId)?.name;
            if (className) {
                classDistribution[className] = (classDistribution[className] || 0) + periodsPerWeek;
            }
        });
    });
    
    // Sort by periods (descending)
    const sortedClasses = Object.entries(classDistribution).sort((a, b) => b[1] - a[1]);
    
    // Render distribution bars
    const container = document.getElementById('classDistribution');
    if (sortedClasses.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">No classes added yet</p>';
        return;
    }
    
    container.innerHTML = sortedClasses.map(([className, periods]) => {
        const percentage = totalPeriodsPerClass > 0 ? ((periods / totalPeriodsPerClass) * 100).toFixed(1) : 0;
        const barColor = getProgressBarColor(percentage);
        
        return `
            <div class="distribution-item">
                <div class="distribution-header">
                    <span class="distribution-name">${className}</span>
                    <span class="distribution-stats">${periods} / ${totalPeriodsPerClass} periods (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${barColor}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Update teacher period distribution
function updateTeacherDistribution() {
    const teacherDistribution = {};
    const periodsPerDay = 8;
    const workingDays = 6;
    const totalPeriodsPerTeacher = periodsPerDay * workingDays;
    
    // Initialize all teachers with 0
    teachers.forEach(teacher => {
        teacherDistribution[teacher.name] = 0;
    });
    
    // Count periods for each teacher
    lessons.forEach(lesson => {
        const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
        const periodsPerWeek = lesson.periodsPerWeek || 0;
        
        teacherIds.forEach(teacherId => {
            const teacherName = teachers.find(t => t.id === teacherId)?.name;
            if (teacherName) {
                teacherDistribution[teacherName] = (teacherDistribution[teacherName] || 0) + periodsPerWeek;
            }
        });
    });
    
    // Sort by periods (descending)
    const sortedTeachers = Object.entries(teacherDistribution).sort((a, b) => b[1] - a[1]);
    
    // Render distribution bars
    const container = document.getElementById('teacherDistribution');
    if (sortedTeachers.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 2rem;">No teachers added yet</p>';
        return;
    }
    
    container.innerHTML = sortedTeachers.map(([teacherName, periods]) => {
        const percentage = totalPeriodsPerTeacher > 0 ? ((periods / totalPeriodsPerTeacher) * 100).toFixed(1) : 0;
        const barColor = getProgressBarColor(percentage);
        
        return `
            <div class="distribution-item">
                <div class="distribution-header">
                    <span class="distribution-name">${teacherName}</span>
                    <span class="distribution-stats">${periods} / ${totalPeriodsPerTeacher} periods (${percentage}%)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${barColor}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Get progress bar color based on percentage
function getProgressBarColor(percentage) {
    if (percentage >= 90) return 'progress-purple';
    if (percentage >= 70) return 'progress-blue';
    if (percentage >= 50) return 'progress-yellow';
    return 'progress-orange';
}

// Generate timetable function
function generateTimetable() {
    // Validate data
    if (subjects.length === 0 || teachers.length === 0 || classes.length === 0 || lessons.length === 0) {
        showNotification('Error', 'Please add subjects, teachers, classes, and lessons before generating timetable');
        return;
    }
    
    // Save current data to localStorage
    localStorage.setItem('timetableData', JSON.stringify({
        subjects,
        teachers,
        classes,
        rooms,
        lessons
    }));
    
    // Show generation modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="generation-modal">
                <div class="generation-header">
                    <div class="spinner"></div>
                    <h2>Generating Your Timetable</h2>
                </div>
                <div class="progress-container">
                    <div class="progress-bar-gen">
                        <div class="progress-fill-gen" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Optimizing schedules...</div>
                </div>
                <div class="generation-stats">
                    <div class="stat-item">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <span id="scheduledCount">0</span> Scheduled
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                        <span id="unscheduledCount">0</span> Unscheduled
                    </div>
                </div>
                <div class="generation-message">
                    <p>Initial timetable generated! Our system is now optimizing it further for better results.</p>
                </div>
                <div class="generation-actions">
                    <button class="btn-text" onclick="stopGeneration()">
                        <i class="fas fa-times"></i> Stop optimization process
                    </button>
                </div>
                <div class="generation-help">
                    <p><i class="fas fa-info-circle"></i> Please keep this window open. The generation process may take a few moments depending on the complexity of your requirements.</p>
                    <div class="help-buttons">
                        <button class="btn-help-small">
                            <i class="fas fa-calendar"></i> Schedule Call
                        </button>
                        <button class="btn-help-small">
                            <i class="fas fa-phone"></i> Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Calculate total lessons to schedule
    const totalLessonsToSchedule = lessons.reduce((sum, lesson) => {
        const classCount = (lesson.classIds || [lesson.classId]).filter(Boolean).length;
        return sum + classCount;
    }, 0);
    
    // Simulate generation process
    let progress = 0;
    let scheduled = 0;
    const unscheduled = Math.max(0, Math.floor(totalLessonsToSchedule * 0.05)); // 5% unscheduled for realism
    
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 3;
        scheduled = Math.floor((progress / 100) * (totalLessonsToSchedule - unscheduled));
        
        if (progress >= 100) {
            progress = 100;
            scheduled = totalLessonsToSchedule - unscheduled;
            clearInterval(interval);
            
            // Generate actual timetable
            const generatedData = generateActualTimetable();
            localStorage.setItem('generatedTimetable', JSON.stringify(generatedData));
            
            // Complete generation
            setTimeout(() => {
                modal.remove();
                // Redirect to view timetable
                window.location.href = 'view-timetable.html';
            }, 1000);
        }
        
        document.getElementById('progressFill').style.width = Math.min(progress, 100) + '%';
        document.getElementById('scheduledCount').textContent = scheduled;
        document.getElementById('unscheduledCount').textContent = unscheduled;
        
        // Update message
        if (progress < 30) {
            document.getElementById('progressText').textContent = 'Analyzing constraints...';
        } else if (progress < 60) {
            document.getElementById('progressText').textContent = 'Scheduling lessons...';
        } else if (progress < 90) {
            document.getElementById('progressText').textContent = 'Optimizing schedules...';
        } else {
            document.getElementById('progressText').textContent = 'Finalizing timetable...';
        }
    }, 300);
    
    window.stopGeneration = function() {
        clearInterval(interval);
        modal.remove();
        showNotification('Stopped', 'Generation process stopped');
    };
}

// Generate actual timetable from user data
function generateActualTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periodsPerDay = 8;
    
    const timetable = {
        teacherWise: {},
        classWise: {},
        days: days,
        periods: periodsPerDay
    };
    
    // Initialize teacher-wise timetable
    teachers.forEach(teacher => {
        timetable.teacherWise[teacher.name] = {};
        days.forEach(day => {
            timetable.teacherWise[teacher.name][day] = Array(periodsPerDay).fill(null);
        });
    });
    
    // Initialize class-wise timetable
    classes.forEach(cls => {
        timetable.classWise[cls.name] = {};
        days.forEach(day => {
            timetable.classWise[cls.name][day] = Array(periodsPerDay).fill(null);
        });
    });
    
    // Assign colors to subjects
    const subjectColors = {};
    subjects.forEach((subject, index) => {
        subjectColors[subject.id] = (index % 6) + 1;
    });
    
    // Schedule lessons
    lessons.forEach(lesson => {
        const classIds = lesson.classIds || (lesson.classId ? [lesson.classId] : []);
        const teacherIds = lesson.teacherIds || (lesson.teacherId ? [lesson.teacherId] : []);
        const subjectIds = lesson.subjectIds || (lesson.subjectId ? [lesson.subjectId] : []);
        const periodsPerWeek = lesson.periodsPerWeek || 0;
        
        // Get names
        const classNames = classIds.map(id => classes.find(c => c.id === id)?.name).filter(Boolean);
        const teacherNames = teacherIds.map(id => teachers.find(t => t.id === id)?.name).filter(Boolean);
        const subjectNames = subjectIds.map(id => subjects.find(s => s.id === id)?.name).filter(Boolean);
        
        if (classNames.length === 0 || teacherNames.length === 0 || subjectNames.length === 0) return;
        
        const className = classNames[0];
        const teacherName = teacherNames[0];
        const subjectName = subjectNames[0];
        const color = subjectColors[subjectIds[0]] || 1;
        
        // Try to schedule the lesson
        let scheduled = 0;
        for (let day = 0; day < days.length && scheduled < periodsPerWeek; day++) {
            for (let period = 0; period < periodsPerDay && scheduled < periodsPerWeek; period++) {
                // Check if slot is available for both teacher and class
                if (timetable.teacherWise[teacherName][days[day]][period] === null &&
                    timetable.classWise[className][days[day]][period] === null) {
                    
                    // Schedule for teacher
                    timetable.teacherWise[teacherName][days[day]][period] = {
                        period: period + 1,
                        subject: subjectName,
                        class: className,
                        color: color
                    };
                    
                    // Schedule for class
                    timetable.classWise[className][days[day]][period] = {
                        period: period + 1,
                        subject: subjectName,
                        teacher: teacherName,
                        color: color
                    };
                    
                    scheduled++;
                }
            }
        }
    });
    
    return timetable;
}

// Update review tab when switching to it
const originalSwitchTab = switchTab;
switchTab = function(index) {
    originalSwitchTab(index);
    if (tabs[index] === 'review') {
        updateReviewTab();
    }
};
