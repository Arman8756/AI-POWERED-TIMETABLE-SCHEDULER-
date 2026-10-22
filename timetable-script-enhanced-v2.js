// Enhanced Add Lesson Modal - Multi-Select with Checkboxes
function showAddLessonModalEnhancedV2(preselectedClass = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content modal-medium">
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
                            <div class="multi-select-wrapper">
                                <div class="multi-select-display" id="classDisplay" onclick="toggleMultiSelectDropdown('classDropdown')">
                                    <span class="placeholder">Select...</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="multi-select-dropdown" id="classDropdown" style="display: none;">
                                    ${classes.map(c => `
                                        <label class="multi-select-option">
                                            <input type="checkbox" class="class-checkbox" value="${c.id}" data-name="${c.name}">
                                            <span>${c.name}</span>
                                            <i class="fas fa-check"></i>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teachers <span class="required">*</span></label>
                            <div class="multi-select-wrapper">
                                <div class="multi-select-display" id="teacherDisplay" onclick="toggleMultiSelectDropdown('teacherDropdown')">
                                    <span class="placeholder">Select...</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="multi-select-dropdown" id="teacherDropdown" style="display: none;">
                                    ${teachers.map(t => `
                                        <label class="multi-select-option">
                                            <input type="checkbox" class="teacher-checkbox" value="${t.id}" data-name="${t.name}">
                                            <span>${t.name}</span>
                                            <i class="fas fa-check"></i>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label class="form-label">Subjects <span class="required">*</span></label>
                            <div class="multi-select-wrapper">
                                <div class="multi-select-display" id="subjectDisplay" onclick="toggleMultiSelectDropdown('subjectDropdown')">
                                    <span class="placeholder">Select...</span>
                                    <i class="fas fa-chevron-down"></i>
                                </div>
                                <div class="multi-select-dropdown" id="subjectDropdown" style="display: none;">
                                    ${subjects.map(s => `
                                        <label class="multi-select-option">
                                            <input type="checkbox" class="subject-checkbox" value="${s.id}" data-name="${s.name}">
                                            <span>${s.name}</span>
                                            <i class="fas fa-check"></i>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lessons per Week <span class="required">*</span></label>
                            <input type="number" id="lessonPeriods" class="form-input" placeholder="1" min="1" max="40" value="1" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            Lesson Length <span class="required">*</span>
                            <i class="fas fa-info-circle tooltip-icon" title="Duration of each lesson period"></i>
                        </label>
                        <select id="lessonLength" class="form-select">
                            <option value="single">Single Period</option>
                            <option value="double">Double Period</option>
                            <option value="triple" selected>Triple Period</option>
                            <option value="4">4 Periods</option>
                            <option value="5">5 Periods</option>
                            <option value="6">6 Periods</option>
                            <option value="7">7 Periods</option>
                            <option value="8">8 Periods</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="splitClasses">
                            <span>Split Classes into Groups</span>
                        </label>
                        <p class="field-hint">Use when classes are split into multiple groups, each with their own teachers and subjects. All scheduled at the same time.</p>
                    </div>
                    
                    <div id="groupsSection" class="groups-section" style="display: none;">
                        <div id="groupsContainer"></div>
                        <button type="button" class="add-group-btn" onclick="addLessonGroupV2()">
                            <i class="fas fa-plus"></i> Add Group
                        </button>
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
    
    // Multi-select functionality
    window.toggleMultiSelectDropdown = function(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const allDropdowns = document.querySelectorAll('.multi-select-dropdown');
        
        // Close all other dropdowns
        allDropdowns.forEach(d => {
            if (d.id !== dropdownId) {
                d.style.display = 'none';
            }
        });
        
        // Toggle current dropdown
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    };
    
    // Update display when checkboxes change
    function updateMultiSelectDisplay(checkboxClass, displayId) {
        const checkboxes = document.querySelectorAll(`.${checkboxClass}:checked`);
        const display = document.getElementById(displayId);
        const placeholder = display.querySelector('.placeholder');
        
        if (checkboxes.length === 0) {
            placeholder.textContent = 'Select...';
            placeholder.style.color = '#9ca3af';
        } else {
            const names = Array.from(checkboxes).map(cb => cb.getAttribute('data-name')).join(', ');
            placeholder.textContent = names;
            placeholder.style.color = '#1f2937';
        }
    }
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.class-checkbox').forEach(cb => {
        cb.addEventListener('change', () => updateMultiSelectDisplay('class-checkbox', 'classDisplay'));
    });
    
    document.querySelectorAll('.teacher-checkbox').forEach(cb => {
        cb.addEventListener('change', () => updateMultiSelectDisplay('teacher-checkbox', 'teacherDisplay'));
    });
    
    document.querySelectorAll('.subject-checkbox').forEach(cb => {
        cb.addEventListener('change', () => updateMultiSelectDisplay('subject-checkbox', 'subjectDisplay'));
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.multi-select-wrapper')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(d => {
                d.style.display = 'none';
            });
        }
    });
    
    let groupCount = 0;
    
    // Toggle split classes
    const splitCheckbox = document.getElementById('splitClasses');
    const groupsSection = document.getElementById('groupsSection');
    
    splitCheckbox.addEventListener('change', function() {
        if (this.checked) {
            groupsSection.style.display = 'block';
            if (groupCount === 0) {
                addLessonGroupV2();
            }
        } else {
            groupsSection.style.display = 'none';
        }
    });
    
    // Add group function
    window.addLessonGroupV2 = function() {
        groupCount++;
        const groupsContainer = document.getElementById('groupsContainer');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card';
        groupDiv.setAttribute('data-group-id', groupCount);
        
        groupDiv.innerHTML = `
            <div class="group-header">
                <h4>Group ${groupCount}</h4>
                <button type="button" class="remove-group-btn" onclick="this.closest('.group-card').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-row-2col">
                <div class="form-group">
                    <label class="form-label">Select Teachers <span class="required">*</span></label>
                    <select class="form-select group-teachers" data-group="${groupCount}">
                        <option value="">Select...</option>
                        ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Subjects <span class="required">*</span></label>
                    <select class="form-select group-subjects" data-group="${groupCount}">
                        <option value="">Select...</option>
                        ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Room (Optional)</label>
                <select class="form-select group-rooms" data-group="${groupCount}">
                    <option value="">-- Select Room --</option>
                    ${rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                </select>
            </div>
        `;
        groupsContainer.appendChild(groupDiv);
    };
    
    // Toggle rooms section
    const assignRoomsCheckbox = document.getElementById('assignRooms');
    const roomsSection = document.getElementById('roomsSection');
    
    assignRoomsCheckbox.addEventListener('change', function() {
        roomsSection.style.display = this.checked ? 'block' : 'none';
    });
    
    const form = modal.querySelector('#addLessonForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get selected classes
        const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked')).map(cb => parseInt(cb.value));
        const selectedTeachers = Array.from(document.querySelectorAll('.teacher-checkbox:checked')).map(cb => parseInt(cb.value));
        const selectedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked')).map(cb => parseInt(cb.value));
        
        const periodsPerWeek = parseInt(document.getElementById('lessonPeriods').value);
        const lessonLength = document.getElementById('lessonLength').value;
        const isSplit = document.getElementById('splitClasses').checked;
        
        if (selectedClasses.length === 0 || !periodsPerWeek) {
            showNotification('Error', 'Please select at least one class');
            return;
        }
        
        if (isSplit) {
            // Handle split classes with groups
            const groups = [];
            const groupCards = document.querySelectorAll('.group-card');
            
            groupCards.forEach((card, idx) => {
                const groupNum = card.getAttribute('data-group-id');
                const teacherSelect = card.querySelector('.group-teachers');
                const subjectSelect = card.querySelector('.group-subjects');
                const roomSelect = card.querySelector('.group-rooms');
                
                const teacherId = parseInt(teacherSelect.value);
                const subjectId = parseInt(subjectSelect.value);
                const roomId = roomSelect.value ? parseInt(roomSelect.value) : null;
                
                if (teacherId && subjectId) {
                    groups.push({
                        groupNumber: parseInt(groupNum),
                        teacherIds: [teacherId],
                        subjectIds: [subjectId],
                        roomIds: roomId ? [roomId] : []
                    });
                }
            });
            
            if (groups.length === 0) {
                showNotification('Error', 'Please add at least one group with teacher and subject');
                return;
            }
            
            lessons.push({
                id: Date.now(),
                classIds: selectedClasses,
                periodsPerWeek,
                lessonLength,
                isSplit: true,
                groups
            });
        } else {
            // Handle simple lesson
            if (selectedTeachers.length === 0 || selectedSubjects.length === 0) {
                showNotification('Error', 'Please select teachers and subjects');
                return;
            }
            
            const roomId = document.getElementById('assignRooms').checked ? 
                          parseInt(document.getElementById('lessonRoom').value) : null;
            
            lessons.push({
                id: Date.now(),
                classIds: selectedClasses,
                teacherIds: selectedTeachers,
                subjectIds: selectedSubjects,
                periodsPerWeek,
                lessonLength,
                roomIds: roomId ? [roomId] : [],
                isSplit: false
            });
        }
        
        renderLessons();
        modal.remove();
        showNotification('Success', 'Lesson added successfully!');
    });
}

// Replace the old function
window.showAddLessonModal = showAddLessonModalEnhancedV2;

// Simplified Add Lesson Modal (for teacher-wise view)
function showAddLessonModalSimplified(preselectedClass = null, preselectedTeacher = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content modal-medium">
            <div class="modal-header">
                <h2>Add New Lesson</h2>
                <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="addLessonFormSimple">
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label class="form-label">Classes <span class="required">*</span></label>
                            <select id="lessonClassSimple" class="form-select" required>
                                <option value="">Select...</option>
                                ${classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                            <p class="validation-message" id="classValidation" style="display: none;">
                                <i class="fas fa-exclamation-circle"></i> At least one class is required
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Teachers <span class="required">*</span></label>
                            <select id="lessonTeacherSimple" class="form-select" required>
                                <option value="">Select...</option>
                                ${teachers.map(t => `<option value="${t.id}" ${preselectedTeacher && t.name === preselectedTeacher ? 'selected' : ''}>${t.name}</option>`).join('')}
                            </select>
                            <p class="validation-message" id="teacherValidation" style="display: none;">
                                <i class="fas fa-exclamation-circle"></i> At least one teacher is required
                            </p>
                        </div>
                    </div>
                    
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label class="form-label">Subjects <span class="required">*</span></label>
                            <select id="lessonSubjectSimple" class="form-select" required>
                                <option value="">Select...</option>
                                ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                            <p class="validation-message" id="subjectValidation" style="display: none;">
                                <i class="fas fa-exclamation-circle"></i> At least one subject is required
                            </p>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Lessons per Week <span class="required">*</span></label>
                            <input type="number" id="lessonPeriodsSimple" class="form-input" placeholder="1" min="1" max="40" value="1" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">
                            Lesson Length <span class="required">*</span>
                            <i class="fas fa-info-circle tooltip-icon" title="Duration of each lesson period"></i>
                        </label>
                        <select id="lessonLengthSimple" class="form-select">
                            <option value="single" selected>Single Period</option>
                            <option value="double">Double Period</option>
                            <option value="triple">Triple Period</option>
                            <option value="4">4 Periods</option>
                            <option value="5">5 Periods</option>
                            <option value="6">6 Periods</option>
                            <option value="7">7 Periods</option>
                            <option value="8">8 Periods</option>
                        </select>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="assignRoomsSimple">
                            <span>Assign Specific Rooms (Optional)</span>
                        </label>
                        <p class="field-hint">Manually assign rooms for this lesson. If not specified, rooms will be assigned automatically during scheduling.</p>
                    </div>
                    
                    <div id="roomsSectionSimple" class="rooms-section" style="display: none;">
                        <div class="form-group">
                            <label class="form-label">Select Room</label>
                            <select id="lessonRoomSimple" class="form-select">
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
    const assignRoomsCheckbox = document.getElementById('assignRoomsSimple');
    const roomsSection = document.getElementById('roomsSectionSimple');
    
    assignRoomsCheckbox.addEventListener('change', function() {
        roomsSection.style.display = this.checked ? 'block' : 'none';
    });
    
    // Form validation and submission
    const form = modal.querySelector('#addLessonFormSimple');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Hide all validation messages
        document.querySelectorAll('.validation-message').forEach(msg => msg.style.display = 'none');
        
        const classId = parseInt(document.getElementById('lessonClassSimple').value);
        const teacherId = parseInt(document.getElementById('lessonTeacherSimple').value);
        const subjectId = parseInt(document.getElementById('lessonSubjectSimple').value);
        const periodsPerWeek = parseInt(document.getElementById('lessonPeriodsSimple').value);
        const lessonLength = document.getElementById('lessonLengthSimple').value;
        const roomId = document.getElementById('assignRoomsSimple').checked ? 
                      parseInt(document.getElementById('lessonRoomSimple').value) : null;
        
        // Validation
        let hasError = false;
        
        if (!classId) {
            document.getElementById('classValidation').style.display = 'block';
            hasError = true;
        }
        
        if (!teacherId) {
            document.getElementById('teacherValidation').style.display = 'block';
            hasError = true;
        }
        
        if (!subjectId) {
            document.getElementById('subjectValidation').style.display = 'block';
            hasError = true;
        }
        
        if (hasError) {
            return;
        }
        
        // Add lesson
        lessons.push({
            id: Date.now(),
            classIds: [classId],
            teacherIds: [teacherId],
            subjectIds: [subjectId],
            periodsPerWeek,
            lessonLength,
            roomIds: roomId ? [roomId] : [],
            isSplit: false
        });
        
        renderLessons();
        modal.remove();
        showNotification('Success', 'Lesson added successfully!');
    });
}
