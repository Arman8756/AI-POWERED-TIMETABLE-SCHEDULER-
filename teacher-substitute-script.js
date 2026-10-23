// ============================================================
// Teacher Substitute Management — Script
// ============================================================
// Data is persisted to localStorage under two keys:
//   'substituteAbsences'    — array of AbsenceRecord
//   'substituteSubstitutions' — array of SubstitutionRecord
//   'substituteAuditLog'    — array of AuditRecord
// Teachers, classes, subjects and the generated timetable are
// read from the keys written by timetable-script.js:
//   'timetableData'       — { subjects, teachers, classes, rooms, lessons }
//   'generatedTimetable'  — { teacherWise, classWise, days, periods }
// ============================================================

// ── In-memory stores ─────────────────────────────────────────
let absences       = [];
let substitutions  = [];
let auditLog       = [];

// ── Loaded from existing timetable data ──────────────────────
let ttTeachers     = [];   // [{ id, name, subjects, ... }]
let ttSubjects     = [];
let ttClasses      = [];
let ttLessons      = [];
let generatedTT    = null; // { teacherWise, classWise, days, periods }

// ── UI state ─────────────────────────────────────────────────
let currentTab     = 'absences';
let editingAbsenceId = null;  // null = new absence

// Sub-picker context
let subPickerAbsenceId  = null;
let subPickerLessonKey  = null; // "Day|Period" string
let subPickerSelectedTeacherId = null;

// Confirm dialog callback
let confirmCallback = null;

// ── Auto-increment IDs ────────────────────────────────────────
function nextId(arr) {
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// ════════════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    populateTeacherFilters();
    renderAll();
    updateStats();
});

function loadFromStorage() {
    // Load timetable setup data
    const ttData = JSON.parse(localStorage.getItem('timetableData') || '{}');
    ttTeachers  = ttData.teachers  || [];
    ttSubjects  = ttData.subjects  || [];
    ttClasses   = ttData.classes   || [];
    ttLessons   = ttData.lessons   || [];
    generatedTT = JSON.parse(localStorage.getItem('generatedTimetable') || 'null');

    // Load substitute data
    absences      = JSON.parse(localStorage.getItem('substituteAbsences')      || '[]');
    substitutions = JSON.parse(localStorage.getItem('substituteSubstitutions') || '[]');
    auditLog      = JSON.parse(localStorage.getItem('substituteAuditLog')      || '[]');
}

function saveAbsencesToStorage() {
    localStorage.setItem('substituteAbsences', JSON.stringify(absences));
}

function saveSubstitutionsToStorage() {
    localStorage.setItem('substituteSubstitutions', JSON.stringify(substitutions));
}

function saveAuditToStorage() {
    localStorage.setItem('substituteAuditLog', JSON.stringify(auditLog));
}

// ════════════════════════════════════════════════════════════════
// AUDIT LOG
// ════════════════════════════════════════════════════════════════
function logAction(entityType, entityId, action, description) {
    const record = {
        id: nextId(auditLog),
        entityType,
        entityId,
        action, // 'create' | 'update' | 'delete'
        description,
        timestamp: new Date().toISOString()
    };
    auditLog.unshift(record); // newest first
    if (auditLog.length > 200) auditLog.length = 200; // cap size
    saveAuditToStorage();
    renderHistory();
}

// ════════════════════════════════════════════════════════════════
// TAB SWITCHING
// ════════════════════════════════════════════════════════════════
function switchTab(tab) {
    currentTab = tab;
    ['absences', 'substitutions', 'history'].forEach(t => {
        document.getElementById('tab' + capitalise(t)).classList.toggle('active', t === tab);
        document.getElementById('panel' + capitalise(t)).style.display = (t === tab) ? '' : 'none';
    });
}

function capitalise(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════
function updateStats() {
    const activeAbsences = absences.filter(a => a.status !== 'cancelled');
    document.getElementById('statTotalAbsences').textContent = activeAbsences.length;

    // A lesson is "covered" if it has at least one assigned (non-cancelled) substitution
    const coveredKeys = new Set(
        substitutions.filter(s => s.status !== 'cancelled')
            .map(s => s.absenceId + '|' + s.lessonKey)
    );

    let totalLessons = 0, covered = 0, pending = 0;
    activeAbsences.forEach(ab => {
        const lessons = getAffectedLessons(ab);
        lessons.forEach(l => {
            totalLessons++;
            const key = ab.id + '|' + l.key;
            if (coveredKeys.has(key)) {
                covered++;
            } else {
                pending++;
            }
        });
    });

    document.getElementById('statUncovered').textContent = totalLessons - covered;
    document.getElementById('statCovered').textContent   = covered;
    document.getElementById('statPending').textContent   = pending;
}

// ════════════════════════════════════════════════════════════════
// TEACHER FILTERS
// ════════════════════════════════════════════════════════════════
function populateTeacherFilters() {
    const absTeacher   = document.getElementById('absTeacher');
    const absFilter    = document.getElementById('absTeacherFilter');
    const subFilter    = document.getElementById('subTeacherFilter');

    // Clear
    [absTeacher, absFilter, subFilter].forEach(el => {
        while (el.options.length > 1) el.remove(1);
    });

    const sorted = [...ttTeachers].sort((a, b) => a.name.localeCompare(b.name));

    sorted.forEach(t => {
        absTeacher.add(new Option(t.name, t.id));
        absFilter.add(new Option(t.name, t.id));
        subFilter.add(new Option(t.name, t.id));
    });

    // Show a note if no teachers loaded
    if (ttTeachers.length === 0) {
        absTeacher.add(new Option('⚠ No teachers — generate a timetable first', ''));
    }
}

// ════════════════════════════════════════════════════════════════
// ABSENCE MODAL
// ════════════════════════════════════════════════════════════════
function openAbsenceModal(absenceId = null) {
    editingAbsenceId = absenceId;
    const modal = document.getElementById('absenceModal');
    const title = document.getElementById('absenceModalTitle');

    if (absenceId) {
        title.innerHTML = '<i class="fas fa-edit" style="color:#f97316;margin-right:.5rem;"></i> Edit Absence';
        const ab = absences.find(a => a.id === absenceId);
        if (ab) {
            document.getElementById('absTeacher').value   = ab.teacherId;
            document.getElementById('absType').value      = ab.absenceType;
            document.getElementById('absStartDate').value = ab.startDate;
            document.getElementById('absEndDate').value   = ab.endDate || '';
            document.getElementById('absPeriods').value   = (ab.periods || []).join(',');
            document.getElementById('absReason').value    = ab.reason;
            document.getElementById('absNotes').value     = ab.notes || '';
            updateAbsenceTypeFields();
        }
    } else {
        title.innerHTML = '<i class="fas fa-user-slash" style="color:#f97316;margin-right:.5rem;"></i> Mark Teacher Absence';
        document.getElementById('absTeacher').value   = '';
        document.getElementById('absType').value      = 'full-day';
        document.getElementById('absStartDate').value = todayStr();
        document.getElementById('absEndDate').value   = '';
        document.getElementById('absPeriods').value   = '';
        document.getElementById('absReason').value    = 'sick';
        document.getElementById('absNotes').value     = '';
        updateAbsenceTypeFields();
    }

    modal.classList.remove('hidden');
}

function closeAbsenceModal() {
    document.getElementById('absenceModal').classList.add('hidden');
    editingAbsenceId = null;
}

function updateAbsenceTypeFields() {
    const type = document.getElementById('absType').value;
    document.getElementById('absEndDateGroup').style.display   = (type === 'date-range')  ? '' : 'none';
    document.getElementById('absPeriodsGroup').style.display   = (type === 'partial-day') ? '' : 'none';
    document.getElementById('absStartDateGroup').querySelector('label').textContent =
        (type === 'date-range') ? 'Start Date *' : 'Date *';
}

function saveAbsence() {
    const teacherId  = document.getElementById('absTeacher').value;
    const absType    = document.getElementById('absType').value;
    const startDate  = document.getElementById('absStartDate').value;
    const endDate    = document.getElementById('absEndDate').value;
    const periodsRaw = document.getElementById('absPeriods').value.trim();
    const reason     = document.getElementById('absReason').value;
    const notes      = document.getElementById('absNotes').value.trim();

    // Validation
    if (!teacherId) { showToast('Please select a teacher.', 'error'); return; }
    if (!startDate) { showToast('Please select a date.', 'error'); return; }
    if (absType === 'date-range') {
        if (!endDate) { showToast('Please enter an end date.', 'error'); return; }
        if (endDate < startDate) { showToast('End date must be on or after start date.', 'error'); return; }
    }

    const periods = periodsRaw
        ? periodsRaw.split(',').map(p => parseInt(p.trim())).filter(n => !isNaN(n) && n > 0)
        : null;

    // Duplicate detection (same teacher, same date, same type) — skip if editing same record
    const duplicate = absences.find(a =>
        a.id !== editingAbsenceId &&
        a.teacherId == teacherId &&
        a.startDate === startDate &&
        a.status !== 'cancelled'
    );
    if (duplicate) {
        showToast('This teacher already has an absence on that date.', 'error');
        return;
    }

    const teacher = ttTeachers.find(t => t.id == teacherId);

    if (editingAbsenceId) {
        // Update existing
        const ab = absences.find(a => a.id === editingAbsenceId);
        if (ab) {
            ab.teacherId   = teacherId;
            ab.teacherName = teacher?.name || 'Unknown';
            ab.absenceType = absType;
            ab.startDate   = startDate;
            ab.endDate     = endDate || null;
            ab.periods     = periods;
            ab.reason      = reason;
            ab.notes       = notes;
            ab.updatedAt   = new Date().toISOString();
            logAction('absence', ab.id, 'update', `Absence updated for ${ab.teacherName} on ${startDate}`);
            showToast(`Absence updated for ${ab.teacherName}.`, 'success');
        }
    } else {
        // Create new
        const newAbsence = {
            id:          nextId(absences),
            teacherId,
            teacherName: teacher?.name || 'Unknown',
            absenceType: absType,
            startDate,
            endDate:     endDate || null,
            periods,
            reason,
            status:      'confirmed',
            notes,
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString()
        };
        absences.push(newAbsence);
        logAction('absence', newAbsence.id, 'create', `Absence marked for ${newAbsence.teacherName} on ${startDate} (${absType})`);
        showToast(`Absence marked for ${newAbsence.teacherName}.`, 'success');
    }

    saveAbsencesToStorage();
    closeAbsenceModal();
    renderAll();
    updateStats();
}

// ════════════════════════════════════════════════════════════════
// DELETE ABSENCE
// ════════════════════════════════════════════════════════════════
function deleteAbsence(absenceId) {
    const ab = absences.find(a => a.id === absenceId);
    if (!ab) return;

    const linkedSubs = substitutions.filter(s => s.absenceId === absenceId && s.status !== 'cancelled');
    const msg = linkedSubs.length > 0
        ? `"${ab.teacherName}" has ${linkedSubs.length} substitute(s) assigned. Deleting will remove all of them. Continue?`
        : `Delete absence record for "${ab.teacherName}" on ${formatDate(ab.startDate)}?`;

    openConfirm('🗑️', 'Delete Absence', msg, () => {
        // Cancel all linked substitutions
        linkedSubs.forEach(s => {
            s.status = 'cancelled';
            logAction('substitution', s.id, 'delete', `Substitution cancelled due to absence deletion`);
        });

        absences = absences.filter(a => a.id !== absenceId);
        logAction('absence', absenceId, 'delete', `Absence deleted for ${ab.teacherName}`);
        saveAbsencesToStorage();
        saveSubstitutionsToStorage();
        renderAll();
        updateStats();
        showToast('Absence deleted.', 'success');
    });
}

// ════════════════════════════════════════════════════════════════
// CANCEL ABSENCE
// ════════════════════════════════════════════════════════════════
function cancelAbsence(absenceId) {
    const ab = absences.find(a => a.id === absenceId);
    if (!ab) return;
    ab.status    = 'cancelled';
    ab.updatedAt = new Date().toISOString();
    logAction('absence', absenceId, 'update', `Absence cancelled for ${ab.teacherName}`);
    saveAbsencesToStorage();
    renderAll();
    updateStats();
    showToast('Absence cancelled.', 'success');
}

// ════════════════════════════════════════════════════════════════
// GET AFFECTED LESSONS
// Returns an array of lesson slot descriptors for a given absence.
// If a generated timetable exists, we pull real slots from it.
// Otherwise we fall back to the lessons array.
// ════════════════════════════════════════════════════════════════
function getAffectedLessons(absence) {
    const teacherName = absence.teacherName ||
        (ttTeachers.find(t => t.id == absence.teacherId)?.name);
    if (!teacherName) return [];

    const dates = getAbsenceDates(absence);
    const lessons = [];

    if (generatedTT && generatedTT.teacherWise && generatedTT.teacherWise[teacherName]) {
        const schedule = generatedTT.teacherWise[teacherName];
        const periods  = absence.periods;

        dates.forEach(dateStr => {
            const dayName = dateToDayName(dateStr);
            const daySlots = schedule[dayName] || [];
            daySlots.forEach((slot, idx) => {
                if (!slot) return;
                const periodNum = idx + 1;
                if (periods && !periods.includes(periodNum)) return;
                lessons.push({
                    key:     `${dayName}|${periodNum}`,
                    date:    dateStr,
                    day:     dayName,
                    period:  periodNum,
                    subject: slot.subject,
                    class:   slot.class,
                    color:   slot.color
                });
            });
        });
    } else {
        // No generated timetable — use lessons array as a best-effort
        const teacherLessons = ttLessons.filter(l => {
            const ids = l.teacherIds || (l.teacherId ? [l.teacherId] : []);
            return ids.includes(absence.teacherId) || ids.includes(String(absence.teacherId));
        });
        dates.forEach(dateStr => {
            teacherLessons.forEach(l => {
                const subjectName = resolveSubjectName(l.subjectIds || [l.subjectId]);
                const className   = resolveClassName(l.classIds   || [l.classId]);
                lessons.push({
                    key:     `${dateStr}|${l.id}`,
                    date:    dateStr,
                    day:     dateToDayName(dateStr),
                    period:  null,
                    subject: subjectName,
                    class:   className,
                    color:   1
                });
            });
        });
    }

    return lessons;
}

function getAbsenceDates(absence) {
    if (absence.absenceType === 'date-range' && absence.endDate) {
        const dates = [];
        let cur = new Date(absence.startDate);
        const end = new Date(absence.endDate);
        while (cur <= end) {
            dates.push(cur.toISOString().slice(0, 10));
            cur.setDate(cur.getDate() + 1);
        }
        return dates;
    }
    return [absence.startDate];
}

function dateToDayName(dateStr) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(dateStr + 'T12:00:00').getDay()];
}

function resolveSubjectName(ids) {
    const id = (Array.isArray(ids) ? ids : [ids]).filter(Boolean)[0];
    return ttSubjects.find(s => s.id == id)?.name || 'Unknown Subject';
}

function resolveClassName(ids) {
    const id = (Array.isArray(ids) ? ids : [ids]).filter(Boolean)[0];
    return ttClasses.find(c => c.id == id)?.name || 'Unknown Class';
}

// ════════════════════════════════════════════════════════════════
// AFFECTED LESSONS MODAL
// ════════════════════════════════════════════════════════════════
function openLessonsModal(absenceId) {
    const ab = absences.find(a => a.id === absenceId);
    if (!ab) return;

    const lessonsList = getAffectedLessons(ab);
    document.getElementById('affectedLessonsSubtitle').textContent =
        `Showing ${lessonsList.length} lesson slot(s) for ${ab.teacherName} — ${formatDate(ab.startDate)}${ab.endDate ? ' to ' + formatDate(ab.endDate) : ''}`;

    const container = document.getElementById('affectedLessonsList');

    if (lessonsList.length === 0) {
        container.innerHTML = `<div class="empty-table-msg">
            <i class="fas fa-calendar-check"></i>
            <p>No scheduled lessons found for this absence period.</p>
            ${!generatedTT ? '<p style="color:#f97316;margin-top:.5rem;"><i class="fas fa-exclamation-triangle"></i> Generate a timetable first to see real lesson slots.</p>' : ''}
        </div>`;
    } else {
        container.innerHTML = lessonsList.map(l => {
            const sub = substitutions.find(s =>
                s.absenceId === absenceId &&
                s.lessonKey === l.key &&
                s.status !== 'cancelled'
            );
            return `<div class="affected-lesson-item">
                <div class="lesson-slot-info">
                    <span class="lesson-slot-label">${l.subject} — ${l.class}</span>
                    <span class="lesson-slot-sub">${formatDate(l.date)} · ${l.day}${l.period ? ' · Period ' + l.period : ''}</span>
                </div>
                ${sub
                    ? `<span class="assigned-tag"><i class="fas fa-check"></i> ${sub.substituteName}</span>`
                    : `<button class="assign-sub-btn" onclick="openSubPicker(${absenceId},'${l.key}','${l.subject}','${l.class}','${l.date}',${l.period||0})">
                         <i class="fas fa-user-plus"></i> Assign Sub
                       </button>`
                }
            </div>`;
        }).join('');
    }

    document.getElementById('lessonsModal').classList.remove('hidden');
}

function closeLessonsModal() {
    document.getElementById('lessonsModal').classList.add('hidden');
}

// ════════════════════════════════════════════════════════════════
// CONFLICT DETECTION
// ════════════════════════════════════════════════════════════════
function checkTeacherAvailability(teacherId, date, period) {
    const dayName = dateToDayName(date);
    const teacher = ttTeachers.find(t => t.id == teacherId);
    if (!teacher) return { available: false, reason: 'Teacher not found' };

    // 1. Check if this teacher is already absent that day/period
    const existingAbsence = absences.find(a => {
        if (a.teacherId != teacherId) return false;
        if (a.status === 'cancelled') return false;
        const abDates = getAbsenceDates(a);
        if (!abDates.includes(date)) return false;
        if (a.periods && period && !a.periods.includes(period)) return false;
        return true;
    });
    if (existingAbsence) {
        return { available: false, reason: `${teacher.name} is marked absent on this date` };
    }

    // 2. Check if teacher is already substituting somewhere that period
    const existingSub = substitutions.find(s => {
        if (s.substituteTeacherId != teacherId) return false;
        if (s.status === 'cancelled') return false;
        if (s.date !== date) return false;
        if (period && s.period && s.period !== period) return false;
        return true;
    });
    if (existingSub) {
        return { available: false, reason: `${teacher.name} is already substituting Period ${existingSub.period}` };
    }

    // 3. Check existing timetable for a scheduled class
    if (generatedTT && generatedTT.teacherWise && generatedTT.teacherWise[teacher.name]) {
        const daySlots = generatedTT.teacherWise[teacher.name][dayName] || [];
        if (period && daySlots[period - 1]) {
            const slot = daySlots[period - 1];
            return { available: false, reason: `${teacher.name} has ${slot.subject} (${slot.class}) scheduled this period` };
        }
    }

    return { available: true, reason: null };
}

// ════════════════════════════════════════════════════════════════
// SUBSTITUTE PICKER MODAL
// ════════════════════════════════════════════════════════════════
function openSubPicker(absenceId, lessonKey, subject, className, date, period) {
    subPickerAbsenceId        = absenceId;
    subPickerLessonKey        = lessonKey;
    subPickerSelectedTeacherId = null;

    const ab = absences.find(a => a.id === absenceId);
    const periodStr = period ? `Period ${period}` : '';
    document.getElementById('subPickerContext').textContent =
        `Subject: ${subject} · Class: ${className} · ${formatDate(date)} ${periodStr}`;
    document.getElementById('subPickerContext').dataset.date    = date;
    document.getElementById('subPickerContext').dataset.period  = period;
    document.getElementById('subPickerContext').dataset.absId   = absenceId;
    document.getElementById('subPickerSearch').value = '';
    document.getElementById('subPickerNotes').value  = '';

    // Close the lessons modal so we don't stack too many
    closeLessonsModal();

    renderSubPicker();
    document.getElementById('subPickerModal').classList.remove('hidden');
}

function closeSubPickerModal() {
    document.getElementById('subPickerModal').classList.add('hidden');
    subPickerAbsenceId         = null;
    subPickerLessonKey         = null;
    subPickerSelectedTeacherId = null;
}

function renderSubPicker() {
    const search   = document.getElementById('subPickerSearch').value.toLowerCase();
    const ctx      = document.getElementById('subPickerContext').dataset;
    const date     = ctx.date;
    const period   = parseInt(ctx.period) || null;
    const absId    = parseInt(ctx.absId);
    const ab       = absences.find(a => a.id === absId);

    const container = document.getElementById('subPickerList');

    // Exclude the absent teacher
    const absentTeacherId = ab?.teacherId;

    const filtered = ttTeachers
        .filter(t => t.id != absentTeacherId)
        .filter(t => !search || t.name.toLowerCase().includes(search));

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#9ca3af;text-align:center;padding:1rem;">No teachers found.</p>';
        return;
    }

    container.innerHTML = filtered.map(t => {
        const avail   = checkTeacherAvailability(t.id, date, period);
        const initial = t.name.charAt(0).toUpperCase();
        const selected = subPickerSelectedTeacherId == t.id;
        return `<div class="sub-picker-item ${!avail.available ? 'unavailable' : ''} ${selected ? 'selected' : ''}"
                     onclick="${avail.available ? `selectSubstitute('${t.id}',this)` : ''}">
            <div class="sub-picker-info">
                <div class="sub-avatar">${initial}</div>
                <div>
                    <div class="sub-picker-name">${t.name}</div>
                    <div class="sub-picker-status">${avail.available ? 'Available' : avail.reason}</div>
                </div>
            </div>
            ${avail.available
                ? `<span class="available-tag">✓ Free</span>`
                : `<span class="conflict-tag">Conflict</span>`
            }
        </div>`;
    }).join('');
}

function selectSubstitute(teacherId, el) {
    subPickerSelectedTeacherId = teacherId;
    document.querySelectorAll('.sub-picker-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
}

function confirmSubstitute() {
    if (!subPickerSelectedTeacherId) {
        showToast('Please select an available substitute teacher.', 'error');
        return;
    }
    const ctx    = document.getElementById('subPickerContext').dataset;
    const date   = ctx.date;
    const period = parseInt(ctx.period) || null;
    const notes  = document.getElementById('subPickerNotes').value.trim();

    const sub = ttTeachers.find(t => t.id == subPickerSelectedTeacherId);
    const ab  = absences.find(a => a.id === subPickerAbsenceId);

    // Remove any previous substitution for same slot
    substitutions = substitutions.filter(s =>
        !(s.absenceId === subPickerAbsenceId && s.lessonKey === subPickerLessonKey)
    );

    const newSub = {
        id:                  nextId(substitutions),
        absenceId:           subPickerAbsenceId,
        substituteTeacherId: subPickerSelectedTeacherId,
        substituteName:      sub.name,
        absentTeacherName:   ab?.teacherName || 'Unknown',
        lessonKey:           subPickerLessonKey,
        date,
        period,
        status:              'assigned',
        assignmentType:      'manual',
        notes,
        createdAt:           new Date().toISOString(),
        updatedAt:           new Date().toISOString()
    };

    substitutions.push(newSub);
    saveSubstitutionsToStorage();
    logAction('substitution', newSub.id, 'create',
        `${sub.name} assigned to substitute ${ab?.teacherName} on ${formatDate(date)}${period ? ' P' + period : ''}`
    );

    closeSubPickerModal();
    renderAll();
    updateStats();
    showToast(`${sub.name} assigned as substitute.`, 'success');

    // Re-open lessons modal so admin can assign more slots
    openLessonsModal(subPickerAbsenceId);
}

// ════════════════════════════════════════════════════════════════
// REMOVE SUBSTITUTION
// ════════════════════════════════════════════════════════════════
function removeSubstitution(subId) {
    const s = substitutions.find(x => x.id === subId);
    if (!s) return;
    openConfirm('🗑️', 'Remove Substitution',
        `Remove ${s.substituteName} as substitute for Period ${s.period || '?'} on ${formatDate(s.date)}?`,
        () => {
            s.status    = 'cancelled';
            s.updatedAt = new Date().toISOString();
            saveSubstitutionsToStorage();
            logAction('substitution', subId, 'delete', `Substitution removed for ${s.substituteName}`);
            renderAll();
            updateStats();
            showToast('Substitution removed.', 'success');
        });
}

function markSubComplete(subId) {
    const s = substitutions.find(x => x.id === subId);
    if (!s) return;
    s.status    = 'completed';
    s.updatedAt = new Date().toISOString();
    saveSubstitutionsToStorage();
    logAction('substitution', subId, 'update', `Substitution marked complete by ${s.substituteName}`);
    renderAll();
    updateStats();
    showToast('Marked as completed.', 'success');
}

// ════════════════════════════════════════════════════════════════
// RENDER — ABSENCES TABLE
// ════════════════════════════════════════════════════════════════
function renderAbsences() {
    const teacherFilter = document.getElementById('absTeacherFilter').value;
    const statusFilter  = document.getElementById('absStatusFilter').value;
    const dateFilter    = document.getElementById('absDateFilter').value;

    let rows = [...absences];
    if (teacherFilter) rows = rows.filter(a => a.teacherId == teacherFilter);
    if (statusFilter)  rows = rows.filter(a => a.status === statusFilter);
    if (dateFilter)    rows = rows.filter(a =>
        a.startDate <= dateFilter && (!a.endDate || a.endDate >= dateFilter)
    );

    // Newest first
    rows.sort((a, b) => b.id - a.id);

    const tbody  = document.getElementById('absencesTableBody');
    const table  = document.getElementById('absencesTable');
    const empty  = document.getElementById('absencesEmpty');

    if (rows.length === 0) {
        table.style.display = 'none';
        empty.style.display = '';
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    tbody.innerHTML = rows.map(ab => {
        const lessons   = getAffectedLessons(ab);
        const coveredN  = lessons.filter(l =>
            substitutions.some(s => s.absenceId === ab.id && s.lessonKey === l.key && s.status !== 'cancelled')
        ).length;
        const total = lessons.length;
        const reasonLabels = { sick:'Sick Leave', personal:'Personal', training:'Training', emergency:'Emergency', other:'Other' };

        return `<tr>
            <td><strong>${ab.teacherName}</strong></td>
            <td>${formatAbsenceType(ab.absenceType)}</td>
            <td>
                <strong>${formatDate(ab.startDate)}</strong>
                ${ab.endDate ? `<br><span style="font-size:.78rem;color:#6b7280;">to ${formatDate(ab.endDate)}</span>` : ''}
                ${ab.periods ? `<br><span style="font-size:.78rem;color:#6b7280;">Periods: ${ab.periods.join(', ')}</span>` : ''}
            </td>
            <td>${reasonLabels[ab.reason] || ab.reason}</td>
            <td>${statusBadge(ab.status)}</td>
            <td>
                <button onclick="openLessonsModal(${ab.id})" style="background:none;border:none;cursor:pointer;color:#f97316;font-size:.85rem;font-weight:500;">
                    <i class="fas fa-list"></i>
                    ${total > 0 ? `${coveredN}/${total} covered` : 'View'}
                </button>
            </td>
            <td style="white-space:nowrap;">
                <button class="btn-icon" title="Edit" onclick="openAbsenceModal(${ab.id})"><i class="fas fa-edit"></i></button>
                ${ab.status !== 'cancelled'
                    ? `<button class="btn-icon" title="Cancel" onclick="cancelAbsence(${ab.id})"><i class="fas fa-ban"></i></button>`
                    : ''}
                <button class="btn-icon red" title="Delete" onclick="deleteAbsence(${ab.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ════════════════════════════════════════════════════════════════
// RENDER — SUBSTITUTIONS TABLE
// ════════════════════════════════════════════════════════════════
function renderSubstitutions() {
    const teacherFilter = document.getElementById('subTeacherFilter').value;
    const statusFilter  = document.getElementById('subStatusFilter').value;

    let rows = substitutions.filter(s => s.status !== 'cancelled' || statusFilter === 'cancelled');
    if (teacherFilter) rows = rows.filter(s => s.substituteTeacherId == teacherFilter);
    if (statusFilter)  rows = rows.filter(s => s.status === statusFilter);

    rows.sort((a, b) => b.id - a.id);

    const tbody  = document.getElementById('substitutionsTableBody');
    const table  = document.getElementById('substitutionsTable');
    const empty  = document.getElementById('substitutionsEmpty');

    const activeRows = rows.filter(s => s.status !== 'cancelled');

    if (activeRows.length === 0 && !statusFilter) {
        table.style.display = 'none';
        empty.style.display = '';
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    // Parse lesson info from key e.g. "Monday|3"
    function parseLessonKey(key) {
        if (!key) return { day: '—', period: '—' };
        const parts = key.split('|');
        return { day: parts[0] || '—', period: parts[1] || '—' };
    }

    tbody.innerHTML = rows.map(s => {
        const ab = absences.find(a => a.id === s.absenceId);
        const { day, period } = parseLessonKey(s.lessonKey);
        // Get subject/class from the absence affected lessons
        let subjectInfo = '—';
        if (ab) {
            const lessonData = getAffectedLessons(ab).find(l => l.key === s.lessonKey);
            if (lessonData) subjectInfo = `${lessonData.subject} · ${lessonData.class}`;
        }
        return `<tr>
            <td>${s.absentTeacherName}</td>
            <td><strong>${s.substituteName}</strong></td>
            <td>${formatDate(s.date)}</td>
            <td>Period ${s.period || '?'}</td>
            <td style="font-size:.85rem;">${subjectInfo}</td>
            <td>${statusBadge(s.status)}</td>
            <td style="white-space:nowrap;">
                ${s.status === 'assigned'
                    ? `<button class="btn-icon" title="Mark Complete" onclick="markSubComplete(${s.id})"><i class="fas fa-check-circle" style="color:#10b981;"></i></button>`
                    : ''}
                <button class="btn-icon red" title="Remove" onclick="removeSubstitution(${s.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// ════════════════════════════════════════════════════════════════
// RENDER — HISTORY
// ════════════════════════════════════════════════════════════════
function renderHistory() {
    const container = document.getElementById('historyList');
    const empty     = document.getElementById('historyEmpty');

    if (auditLog.length === 0) {
        empty.style.display = '';
        container.querySelector && container.querySelectorAll('.audit-item').forEach(el => el.remove());
        return;
    }

    empty.style.display = 'none';
    container.innerHTML = `<div id="historyEmpty" style="display:none;"></div>` +
        auditLog.map(r => `
        <div class="audit-item">
            <div class="audit-dot ${r.action}">
                ${{ create:'<i class="fas fa-plus"></i>', update:'<i class="fas fa-edit"></i>', delete:'<i class="fas fa-trash-alt"></i>' }[r.action]}
            </div>
            <div>
                <div class="audit-text">${r.description}</div>
                <div class="audit-time">${formatDateTime(r.timestamp)}</div>
            </div>
        </div>`).join('');
}

function clearHistory() {
    openConfirm('🗑️', 'Clear History', 'Delete all audit log entries? This cannot be undone.', () => {
        auditLog = [];
        saveAuditToStorage();
        renderHistory();
        showToast('History cleared.');
    });
}

// ════════════════════════════════════════════════════════════════
// RENDER ALL
// ════════════════════════════════════════════════════════════════
function renderAll() {
    renderAbsences();
    renderSubstitutions();
    renderHistory();
}

// ════════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ════════════════════════════════════════════════════════════════
function openConfirm(icon, title, message, callback) {
    document.getElementById('confirmIcon').textContent    = icon;
    document.getElementById('confirmTitle').textContent   = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    confirmCallback = null;
}

function executeConfirm() {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
}

// ════════════════════════════════════════════════════════════════
// TOAST
// ════════════════════════════════════════════════════════════════
let toastTimer = null;
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const icon  = document.getElementById('toastIcon');
    toast.className = `toast ${type}`;
    icon.className  = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    document.getElementById('toastMsg').textContent = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════
function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatAbsenceType(type) {
    return { 'full-day': 'Full Day', 'partial-day': 'Partial Day', 'date-range': 'Date Range' }[type] || type;
}

function statusBadge(status) {
    const map = {
        pending:   '<span class="badge pending">Pending</span>',
        confirmed: '<span class="badge confirmed">Confirmed</span>',
        cancelled: '<span class="badge cancelled">Cancelled</span>',
        assigned:  '<span class="badge assigned">Assigned</span>',
        completed: '<span class="badge completed">Completed</span>',
        uncovered: '<span class="badge uncovered">Uncovered</span>'
    };
    return map[status] || `<span class="badge">${status}</span>`;
}
