// Add interactivity to the application

document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to action cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            handleCardClick(title);
        });
    });

    // Add click handler to buttons
    const buttons = document.querySelectorAll('.btn-primary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const buttonText = this.textContent.trim();
            handleButtonClick(buttonText);
        });
    });

    // Add click handler to support button
    const supportBtn = document.querySelector('.support-btn');
    if (supportBtn) {
        supportBtn.addEventListener('click', function() {
            showNotification('Support', 'Opening support center...');
        });
    }

    // Add click handler to org dropdown
    const orgDropdown = document.querySelector('.org-dropdown');
    if (orgDropdown) {
        orgDropdown.addEventListener('click', function() {
            showNotification('Organization', 'Organization settings coming soon!');
        });
    }
});

function handleCardClick(cardTitle) {
    switch(cardTitle) {
        case 'Generate Timetable':
            showNotification('Generate Timetable', 'Opening timetable generator with AI assistance...');
            setTimeout(() => {
                window.location.href = 'generate-timetable.html';
            }, 500);
            break;
        case 'Teacher Substitute':
            showNotification('Teacher Substitute', 'Opening substitute management system...');
            setTimeout(() => {
                window.location.href = 'teacher-substitute.html';
            }, 500);
            break;
        case 'Step-by-Step Guide':
            showNotification('Guide', 'Opening interactive guide...');
            break;
        case 'Schedule Demo':
            showNotification('Demo', 'Scheduling a personalized demo...');
            break;
        case 'Invite Users':
            showNotification('Invite Users', 'Opening invitation form...');
            break;
        case 'Manage Users':
            showNotification('Manage Users', 'Opening user management panel...');
            break;
    }
}

function handleButtonClick(buttonText) {
    if (buttonText.includes('New Timetable') || buttonText.includes('Generate First Timetable')) {
        // Redirect to timetable generation page
        window.location.href = 'generate-timetable.html';
    }
}

function showNotification(title, message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    `;

    // Add styles for notification
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

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function showTimetableForm() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-robot"></i> AI-Powered Timetable Generator</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="timetableForm">
                    <div class="form-group">
                        <label>Institution Name</label>
                        <input type="text" placeholder="Enter institution name" required>
                    </div>
                    <div class="form-group">
                        <label>Number of Classes</label>
                        <input type="number" placeholder="e.g., 10" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Number of Teachers</label>
                        <input type="number" placeholder="e.g., 25" min="1" required>
                    </div>
                    <div class="form-group">
                        <label>Working Days</label>
                        <select required>
                            <option value="">Select working days</option>
                            <option value="5">5 Days (Mon-Fri)</option>
                            <option value="6">6 Days (Mon-Sat)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Periods per Day</label>
                        <input type="number" placeholder="e.g., 8" min="1" max="12" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-magic"></i> Generate with AI
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease;
        }

        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            font-size: 1.25rem;
            color: #1f2937;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .modal-header i {
            color: #7c3aed;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            transition: color 0.3s ease;
        }

        .close-btn:hover {
            color: #1f2937;
        }

        .modal-body {
            padding: 1.5rem;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #374151;
            font-weight: 500;
        }

        .form-group input,
        .form-group select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 0.95rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #7c3aed;
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 2rem;
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes scaleIn {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
    `;

    if (!document.querySelector('style[data-modal]')) {
        modalStyle.setAttribute('data-modal', 'true');
        document.head.appendChild(modalStyle);
    }

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#timetableForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        modal.remove();
        showNotification('AI Processing', 'Generating your timetable with AI algorithms...');
        
        // Simulate AI processing
        setTimeout(() => {
            showNotification('Success', 'Timetable generated successfully! Redirecting...');
        }, 2000);
    });
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
