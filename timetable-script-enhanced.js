// Enhanced Add Lesson Modal with Split Classes and Multi-select
function showAddLessonModalEnhanced(preselectedClass = null) {
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
                    <div class="form-group">
                        <label class="form-label">Classes <span class="required">*</span></label>
                        <select id="lessonClass" class="form-select" multiple required>
                            ${classes.map(c => `<option value="${c.id}" ${preselectedClass === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                        <p class="field-hint">Hold Ctrl/Cmd to select multiple classes</p>
                    </div>
                    
                    <div class="form-row-2col">
                        <div class="form-group">
                            <label class="form-label">Lessons per Week <span class="required">*</span></label>
                            <input type="number" id="lessonPeriods" class="form-input" placeholder="5" min="1" max="40" value="5" required>
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
                                <option value="4">4 Periods</option>
                                <option value="5">5 Periods</option>
                                <option value="6">6 Periods</option>
                                <option value="7">7 Periods</option>
                                <option value="8">8 Periods</option>
                            </select>
                        </div>
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
                        <button type="button" class="add-group-btn" onclick="addLessonGroup()">
                            <i class="fas fa-plus"></i> Add Group
                        </button>
                    </div>
                    
                    <div id="simpleSection">
                        <div class="form-group">
                            <label class="form-label">Teachers <span class="required">*</span></label>
                            <select id="lessonTeacher" class="form-select" multiple required>
                                ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                            </select>
                            <p class="field-hint">Hold Ctrl/Cmd to select multiple teachers</p>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Subjects <span class="required">*</span></label>
                            <select id="lessonSubject" class="form-select" multiple required>
                                ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                            <p class="field-hint">Hold Ctrl/Cmd to select multiple subjects</p>
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
                            <label class="form-label">Select Rooms (Optional)</label>
                            <select id="lessonRoom" class="form-select" multiple>
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
    
    let groupCount = 0;
    
    // Toggle split classes
    const splitCheckbox = document.getElementById('splitClasses');
    const groupsSection = document.getElementById('groupsSection');
    const simpleSection = document.getElementById('simpleSection');
    
    splitCheckbox.addEventListener('change', function() {
        if (this.checked) {
            groupsSection.style.display = 'block';
            simpleSection.style.display = 'none';
            document.getElementById('lessonTeacher').removeAttribute('required');
            document.getElementById('lessonSubject').removeAttribute('required');
            if (groupCount === 0) {
                addLessonGroup();
            }
        } else {
            groupsSection.style.display = 'none';
            simpleSection.style.display = 'block';
            document.getElementById('lessonTeacher').setAttribute('required', 'required');
            document.getElementById('lessonSubject').setAttribute('required', 'required');
        }
    });
    
    // Add group function
    window.addLessonGroup = function() {
        groupCount++;
        const groupsContainer = document.getElementById('groupsContainer');
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-card';
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
                    <select class="form-select group-teachers" multiple>
                        ${teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Select Subjects <span class="required">*</span></label>
                    <select class="form-select group-subjects" multiple>
                        ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Rooms (Optional)</label>
                <p class="field-hint">Select specific rooms for this group. If not specified, rooms will be assigned automatically.</p>
                <select class="form-select group-rooms" multiple>
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
        
        const classIds = Array.from(document.getElementById('lessonClass').selectedOptions).map(o => parseInt(o.value));
        const periodsPerWeek = parseInt(document.getElementById('lessonPeriods').value);
        const lessonLength = document.getElementById('lessonLength').value;
        const isSplit = document.getElementById('splitClasses').checked;
        
        if (classIds.length === 0 || !periodsPerWeek) {
            showNotification('Error', 'Please fill all required fields');
            return;
        }
        
        if (isSplit) {
            // Handle split classes with groups
            const groups = [];
            document.querySelectorAll('.group-card').forEach((groupCard, index) => {
                const teacherIds = Array.from(groupCard.querySelectorAll('.group-teachers')[0].selectedOptions).map(o => parseInt(o.value));
                const subjectIds = Array.from(groupCard.querySelectorAll('.group-subjects')[0].selectedOptions).map(o => parseInt(o.value));
                const roomIds = Array.from(groupCard.querySelectorAll('.group-rooms')[0].selectedOptions).map(o => parseInt(o.value));
                
                groups.push({
                    groupNumber: index + 1,
                    teacherIds,
                    subjectIds,
                    roomIds
                });
            });
            
            if (groups.length === 0) {
                showNotification('Error', 'Please add at least one group');
                return;
            }
            
            lessons.push({
                id: Date.now(),
                classIds,
                periodsPerWeek,
                lessonLength,
                isSplit: true,
                groups
            });
        } else {
            // Handle simple lesson
            const teacherIds = Array.from(document.getElementById('lessonTeacher').selectedOptions).map(o => parseInt(o.value));
            const subjectIds = Array.from(document.getElementById('lessonSubject').selectedOptions).map(o => parseInt(o.value));
            const roomIds = document.getElementById('assignRooms').checked ? 
                          Array.from(document.getElementById('lessonRoom').selectedOptions).map(o => parseInt(o.value)) : [];
            
            if (teacherIds.length === 0 || subjectIds.length === 0) {
                showNotification('Error', 'Please select teachers and subjects');
                return;
            }
            
            lessons.push({
                id: Date.now(),
                classIds,
                teacherIds,
                subjectIds,
                periodsPerWeek,
                lessonLength,
                roomIds,
                isSplit: false
            });
        }
        
        renderLessons();
        modal.remove();
        showNotification('Success', 'Lesson added successfully!');
    });
}

// Replace the old function
window.showAddLessonModal = showAddLessonModalEnhanced;
