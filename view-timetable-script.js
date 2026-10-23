// View Timetable Script
let currentView = 'teacher';
let generatedTimetable = null;

// Load timetable data from localStorage
function loadTimetableData() {
    const data = localStorage.getItem('generatedTimetable');
    if (data) {
        generatedTimetable = JSON.parse(data);
        renderTimetable();
        updateClassDistribution();
        updateTeacherDistribution();
    } else {
        // Show message that no timetable is generated
        document.getElementById('timetableGrid').innerHTML = `
            <div style="text-align: center; padding: 4rem;">
                <i class="fas fa-calendar-times" style="font-size: 4rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                <h3 style="color: #1f2937; margin-bottom: 0.5rem;">No Timetable Generated</h3>
                <p style="color: #6b7280; margin-bottom: 2rem;">Please generate a timetable first from the setup wizard.</p>
                <button class="btn-primary" onclick="window.location.href='generate-timetable.html'">
                    <i class="fas fa-arrow-left"></i> Go to Setup
                </button>
            </div>
        `;
    }
}

// Switch view
function switchView(view) {
    currentView = view;
    document.getElementById('classWiseBtn').classList.toggle('active', view === 'class');
    document.getElementById('teacherWiseBtn').classList.toggle('active', view === 'teacher');
    renderTimetable();
}

// Render timetable
function renderTimetable() {
    const container = document.getElementById('timetableGrid');
    
    if (currentView === 'teacher') {
        renderTeacherWiseTimetable(container);
    } else {
        renderClassWiseTimetable(container);
    }
}

// Render teacher-wise timetable
function renderTeacherWiseTimetable(container) {
    const data = generatedTimetable.teacherWise;
    const days = generatedTimetable.days;
    const periods = generatedTimetable.periods;
    
    let html = '<table class="timetable-table"><thead><tr>';
    html += '<th>Teacher</th>';
    
    // Add day headers with periods
    days.forEach(day => {
        for (let p = 1; p <= periods; p++) {
            html += `<th style="min-width: 120px;">
                <div style="font-weight: 700; margin-bottom: 0.25rem;">${day}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">P${p}</div>
            </th>`;
        }
    });
    
    html += '</tr></thead><tbody>';
    
    // Add teacher rows
    Object.keys(data).forEach(teacher => {
        html += `<tr><td class="teacher-cell">${teacher}</td>`;
        
        days.forEach(day => {
            const daySchedule = data[teacher][day] || [];
            daySchedule.forEach(lesson => {
                if (lesson) {
                    html += `<td>
                        <div class="lesson-card color-${lesson.color}">
                            <div class="lesson-subject">${lesson.subject}</div>
                            <div class="lesson-details">${lesson.class}</div>
                        </div>
                    </td>`;
                } else {
                    html += '<td></td>';
                }
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Render class-wise timetable
function renderClassWiseTimetable(container) {
    const data = generatedTimetable.classWise;
    const days = generatedTimetable.days;
    const periods = generatedTimetable.periods;
    
    let html = '<table class="timetable-table"><thead><tr>';
    html += '<th>Class</th>';
    
    // Add day headers with periods
    days.forEach(day => {
        for (let p = 1; p <= periods; p++) {
            html += `<th style="min-width: 120px;">
                <div style="font-weight: 700; margin-bottom: 0.25rem;">${day}</div>
                <div style="font-size: 0.75rem; color: #6b7280;">P${p}</div>
            </th>`;
        }
    });
    
    html += '</tr></thead><tbody>';
    
    // Add class rows
    Object.keys(data).forEach(className => {
        html += `<tr><td class="class-cell">${className}</td>`;
        
        days.forEach(day => {
            const daySchedule = data[className][day] || [];
            daySchedule.forEach(lesson => {
                if (lesson) {
                    html += `<td>
                        <div class="lesson-card color-${lesson.color}">
                            <div class="lesson-subject">${lesson.subject}</div>
                            <div class="lesson-details">${lesson.teacher}</div>
                        </div>
                    </td>`;
                } else {
                    html += '<td></td>';
                }
            });
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Download timetable
function downloadTimetable() {
    // Simple download as HTML
    const content = document.getElementById('timetableGrid').innerHTML;
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Timetable</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                th { background: #f3f4f6; font-weight: 600; }
                .lesson-card { padding: 8px; border-radius: 4px; margin: 2px; }
                .color-1 { background: #dbeafe; }
                .color-2 { background: #d1fae5; }
                .color-3 { background: #fef3c7; }
                .color-4 { background: #fce7f3; }
                .color-5 { background: #e0e7ff; }
                .color-6 { background: #fee2e2; }
            </style>
        </head>
        <body>
            <h1>Generated Timetable</h1>
            ${content}
        </body>
        </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timetable.html';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Success', 'Timetable downloaded successfully!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTimetableData();
});

// ── Distribution chart helpers ────────────────────────────────

/**
 * Returns a CSS class name for the progress bar based on the given percentage.
 * >= 90% → progress-purple
 * >= 75% → progress-red
 * >= 50% → progress-yellow
 *  < 50% → progress-green
 */
function getProgressBarColor(percentage) {
    if (percentage >= 90) return 'progress-purple';
    if (percentage >= 75) return 'progress-red';
    if (percentage >= 50) return 'progress-yellow';
    return 'progress-green';
}

/**
 * Calculates and renders the Class Period Distribution chart.
 * Iterates through generatedTimetable.classWise and counts non-null
 * entries (scheduled periods) for each class, then displays each
 * class as a labelled progress bar.
 */
function updateClassDistribution() {
    const container = document.getElementById('classDistribution');
    if (!container) return;

    if (!generatedTimetable || !generatedTimetable.classWise) {
        container.innerHTML = '<div class="distribution-empty">No timetable data available.</div>';
        return;
    }

    const classWise    = generatedTimetable.classWise;
    const days         = generatedTimetable.days    || [];
    const periodsPerDay = generatedTimetable.periods || 0;
    const totalPeriods  = days.length * periodsPerDay; // e.g. 6 × 8 = 48

    const classNames = Object.keys(classWise);
    if (classNames.length === 0) {
        container.innerHTML = '<div class="distribution-empty">No classes found in timetable.</div>';
        return;
    }

    // Sort classes alphabetically for consistent display
    classNames.sort();

    let html = '';
    classNames.forEach(className => {
        let scheduled = 0;
        days.forEach(day => {
            const slots = classWise[className][day] || [];
            slots.forEach(slot => { if (slot !== null) scheduled++; });
        });

        const safeTotal = totalPeriods > 0 ? totalPeriods : 1;
        const pct       = Math.min((scheduled / safeTotal) * 100, 100);
        const colorClass = getProgressBarColor(pct);

        html += `
        <div class="distribution-item">
            <div class="distribution-header">
                <span class="distribution-name">${className}</span>
                <span class="distribution-stats">${scheduled} / ${totalPeriods} periods (${pct.toFixed(1)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${colorClass}" style="width:${pct}%"></div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

/**
 * Calculates and renders the Teacher Period Distribution chart.
 * Iterates through generatedTimetable.teacherWise and counts non-null
 * entries (scheduled periods) for each teacher, then displays each
 * teacher as a labelled progress bar.
 */
function updateTeacherDistribution() {
    const container = document.getElementById('teacherDistribution');
    if (!container) return;

    if (!generatedTimetable || !generatedTimetable.teacherWise) {
        container.innerHTML = '<div class="distribution-empty">No timetable data available.</div>';
        return;
    }

    const teacherWise   = generatedTimetable.teacherWise;
    const days          = generatedTimetable.days    || [];
    const periodsPerDay = generatedTimetable.periods || 0;
    const totalPeriods  = days.length * periodsPerDay; // e.g. 6 × 8 = 48

    const teacherNames = Object.keys(teacherWise);
    if (teacherNames.length === 0) {
        container.innerHTML = '<div class="distribution-empty">No teachers found in timetable.</div>';
        return;
    }

    // Sort by scheduled periods descending so busiest teachers appear first
    const counts = teacherNames.map(name => {
        let scheduled = 0;
        days.forEach(day => {
            const slots = teacherWise[name][day] || [];
            slots.forEach(slot => { if (slot !== null) scheduled++; });
        });
        return { name, scheduled };
    });
    counts.sort((a, b) => b.scheduled - a.scheduled);

    const safeTotal = totalPeriods > 0 ? totalPeriods : 1;

    let html = '';
    counts.forEach(({ name, scheduled }) => {
        const pct        = Math.min((scheduled / safeTotal) * 100, 100);
        const colorClass = getProgressBarColor(pct);

        html += `
        <div class="distribution-item">
            <div class="distribution-header">
                <span class="distribution-name">${name}</span>
                <span class="distribution-stats">${scheduled} / ${totalPeriods} periods (${pct.toFixed(1)}%)</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${colorClass}" style="width:${pct}%"></div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}
