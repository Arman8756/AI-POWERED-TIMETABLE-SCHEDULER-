// View Timetable Script
let currentView = 'teacher';
let generatedTimetable = null;

// Load timetable data from localStorage
function loadTimetableData() {
    const data = localStorage.getItem('generatedTimetable');
    if (data) {
        generatedTimetable = JSON.parse(data);
        renderTimetable();
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
