# Distribution Charts Zero Percent Fix - Bugfix Design

## Overview

This bugfix addresses the issue where distribution charts on the view-timetable.html page incorrectly display "0 / 48 periods (0.0%)" for all classes and teachers, despite a timetable being successfully generated with scheduled lessons. The root cause is that view-timetable-script.js lacks the logic to calculate period distributions from the generated timetable data structure stored in localStorage.

The fix involves adding distribution calculation functions to view-timetable-script.js that iterate through the `classWise` and `teacherWise` objects in the `generatedTimetable` structure, count non-null scheduled periods, and update the distribution chart displays. Additionally, the distribution chart HTML sections need to be added to view-timetable.html if they don't already exist.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user views view-timetable.html after generating a timetable, distribution charts show 0% instead of actual period counts
- **Property (P)**: The desired behavior - distribution charts should display accurate period counts and percentages calculated from the generatedTimetable data
- **Preservation**: Existing timetable grid rendering, view switching, and download functionality that must remain unchanged by the fix
- **generatedTimetable**: The object stored in localStorage containing `classWise`, `teacherWise`, `days`, and `periods` properties with scheduled lesson data
- **classWise**: Object mapping class names to their weekly schedules (days → period arrays with lesson objects or null)
- **teacherWise**: Object mapping teacher names to their weekly schedules (days → period arrays with lesson objects or null)
- **updateClassDistribution**: Function to calculate and display class period distribution statistics
- **updateTeacherDistribution**: Function to calculate and display teacher period distribution statistics

## Bug Details

### Bug Condition

The bug manifests when a user navigates to view-timetable.html after successfully generating a timetable. The distribution chart sections either don't exist in the HTML or display "0 / 48 periods (0.0%)" for all classes and teachers. The view-timetable-script.js file successfully loads the generatedTimetable from localStorage and renders the timetable grid correctly, but it does not calculate or update distribution statistics.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type PageLoadEvent on view-timetable.html
  OUTPUT: boolean
  
  RETURN generatedTimetable EXISTS in localStorage
         AND generatedTimetable.classWise HAS scheduled lessons (non-null entries)
         AND generatedTimetable.teacherWise HAS scheduled lessons (non-null entries)
         AND distributionChartsDisplay "0 / 48 periods (0.0%)" OR distributionChartsNotRendered
END FUNCTION
```

### Examples

- **Example 1**: User generates a timetable with 3 classes (Class A, Class B, Class C) and 2 teachers (Teacher X, Teacher Y). Class A has 12 scheduled periods, Class B has 16 periods, Class C has 10 periods. Teacher X has 20 periods, Teacher Y has 18 periods. When viewing view-timetable.html, the distribution charts show "0 / 48 periods (0.0%)" for all classes and teachers instead of the actual counts.

- **Example 2**: User generates a timetable where Class 10A has 24 scheduled periods out of 48 possible (50%). The class distribution chart should display "24 / 48 periods (50.0%)" with a progress bar at 50%, but instead shows "0 / 48 periods (0.0%)".

- **Example 3**: Teacher "John Smith" has 30 scheduled periods across the week. The teacher distribution chart should display "30 / 48 periods (62.5%)" with appropriate color coding, but shows "0 / 48 periods (0.0%)".

- **Edge Case**: User generates a timetable where a class has 0 scheduled periods (no lessons assigned). The distribution chart should correctly display "0 / 48 periods (0.0%)" for that specific class, while other classes with scheduled lessons show their actual counts.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Timetable grid rendering in both teacher-wise and class-wise views must continue to work exactly as before
- View switching between teacher-wise and class-wise must remain unchanged
- Download timetable functionality must continue to work
- "No Timetable Generated" message display when localStorage is empty must remain unchanged
- Lesson card display with subject names, teacher/class details, and color coding must remain unchanged
- Filter functionality (if implemented) must remain unchanged

**Scope:**
All inputs that do NOT involve distribution chart calculation and display should be completely unaffected by this fix. This includes:
- Timetable grid rendering logic (renderTeacherWiseTimetable, renderClassWiseTimetable)
- View switching logic (switchView function)
- Download functionality (downloadTimetable function)
- Initial page load and data validation logic

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Missing Distribution Calculation Functions**: The view-timetable-script.js file does not contain `updateClassDistribution()` and `updateTeacherDistribution()` functions. These functions exist in timetable-script.js but operate on the `lessons` array, not the `generatedTimetable` structure.

2. **Missing Distribution HTML Sections**: The view-timetable.html file may not contain the distribution chart HTML sections (`<div id="classDistribution">` and `<div id="teacherDistribution">`), or these sections exist but are never populated with data.

3. **Incorrect Data Structure Access**: If distribution functions exist, they may be trying to access the wrong data structure. The timetable-script.js functions iterate through the `lessons` array, but view-timetable-script.js needs to iterate through `generatedTimetable.classWise` and `generatedTimetable.teacherWise` objects.

4. **Missing Function Invocation**: Even if distribution functions exist, they may not be called after loading the timetable data from localStorage in the `loadTimetableData()` function.

## Correctness Properties

Property 1: Bug Condition - Distribution Charts Display Actual Period Counts

_For any_ page load where a generated timetable exists in localStorage with scheduled lessons (isBugCondition returns true), the fixed view-timetable-script.js SHALL calculate the actual number of scheduled periods for each class and teacher by counting non-null entries in the generatedTimetable structure, and SHALL display these counts with correct percentages in the distribution charts.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Timetable Grid Rendering Unchanged

_For any_ page load where a generated timetable exists in localStorage (regardless of distribution chart state), the fixed code SHALL produce exactly the same timetable grid rendering as the original code, preserving all existing functionality for grid display, view switching, lesson card rendering, and download functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `view-timetable.html`

**Changes**:
1. **Add Distribution Chart HTML Sections**: Insert distribution chart sections after the timetable grid and before the unscheduled section
   - Add a container div with class `distribution-container`
   - Add class distribution section with `<div id="classDistribution" class="distribution-list">`
   - Add teacher distribution section with `<div id="teacherDistribution" class="distribution-list">`
   - Include appropriate section titles with icons

2. **Add Distribution Chart Styles**: Add CSS styles for distribution charts (can be inline or reference timetable-styles.css)
   - `.distribution-container` - grid layout for two columns
   - `.distribution-section` - styling for each distribution section
   - `.distribution-item` - styling for each class/teacher bar
   - `.distribution-header` - styling for name and stats
   - `.progress-bar` and `.progress-fill` - styling for progress bars
   - Color classes: `.progress-purple`, `.progress-red`, `.progress-yellow`, `.progress-green`

**File 2**: `view-timetable-script.js`

**Function**: Add new functions and modify existing `loadTimetableData()`

**Specific Changes**:
1. **Add updateClassDistribution Function**: Create a function that calculates class period distribution from generatedTimetable.classWise
   - Initialize period counts for all classes to 0
   - Iterate through `generatedTimetable.classWise[className][day]` arrays
   - Count non-null entries (scheduled periods) for each class
   - Calculate percentages: (scheduled_periods / total_periods) × 100
   - Generate HTML with distribution bars and stats
   - Update `#classDistribution` element

2. **Add updateTeacherDistribution Function**: Create a function that calculates teacher period distribution from generatedTimetable.teacherWise
   - Initialize period counts for all teachers to 0
   - Iterate through `generatedTimetable.teacherWise[teacherName][day]` arrays
   - Count non-null entries (scheduled periods) for each teacher
   - Calculate percentages: (scheduled_periods / total_periods) × 100
   - Generate HTML with distribution bars and stats
   - Update `#teacherDistribution` element

3. **Add getProgressBarColor Helper Function**: Create a function that returns color class based on percentage
   - >= 90%: 'progress-purple'
   - >= 75%: 'progress-red'
   - >= 50%: 'progress-yellow'
   - < 50%: 'progress-green'

4. **Modify loadTimetableData Function**: Add calls to distribution functions after successful data load
   - After `renderTimetable()`, call `updateClassDistribution()`
   - After `updateClassDistribution()`, call `updateTeacherDistribution()`

5. **Handle Edge Cases**: Ensure functions handle edge cases gracefully
   - Empty timetable (no scheduled lessons)
   - Missing classes or teachers in generatedTimetable
   - Division by zero when calculating percentages

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Manually test the view-timetable.html page with a generated timetable in localStorage. Inspect the distribution chart sections to verify they show "0 / 48 periods (0.0%)" or are missing entirely. Use browser DevTools to examine the generatedTimetable object structure and confirm it contains scheduled lessons. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Missing Distribution Sections Test**: Load view-timetable.html and inspect HTML to check if distribution chart sections exist (will fail if sections are missing)
2. **Zero Percent Display Test**: Load view-timetable.html with a generated timetable and verify distribution charts show "0 / 48 periods (0.0%)" for all classes and teachers (will fail on unfixed code)
3. **Data Structure Verification Test**: Use browser console to inspect `localStorage.getItem('generatedTimetable')` and verify it contains classWise and teacherWise objects with scheduled lessons (should pass - data exists)
4. **Function Existence Test**: Check if `updateClassDistribution` and `updateTeacherDistribution` functions exist in view-timetable-script.js (will fail on unfixed code)

**Expected Counterexamples**:
- Distribution chart sections either don't exist in HTML or display "0 / 48 periods (0.0%)"
- Possible causes: missing HTML sections, missing calculation functions, functions not called, incorrect data structure access

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL pageLoad WHERE isBugCondition(pageLoad) DO
  result := loadTimetableData_fixed()
  ASSERT classDistributionDisplaysActualCounts(result)
  ASSERT teacherDistributionDisplaysActualCounts(result)
  ASSERT percentagesCalculatedCorrectly(result)
END FOR
```

**Test Cases**:
1. **Class Distribution Accuracy Test**: Generate a timetable with known period counts per class, load view-timetable.html, verify distribution charts display correct counts and percentages
2. **Teacher Distribution Accuracy Test**: Generate a timetable with known period counts per teacher, load view-timetable.html, verify distribution charts display correct counts and percentages
3. **Percentage Calculation Test**: Verify percentages are calculated correctly using formula (scheduled / total) × 100
4. **Progress Bar Width Test**: Verify progress bar widths match calculated percentages
5. **Color Coding Test**: Verify progress bars use correct color classes based on percentage thresholds

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL pageLoad WHERE NOT isBugCondition(pageLoad) DO
  ASSERT renderTimetable_original(pageLoad) = renderTimetable_fixed(pageLoad)
  ASSERT switchView_original(pageLoad) = switchView_fixed(pageLoad)
  ASSERT downloadTimetable_original(pageLoad) = downloadTimetable_fixed(pageLoad)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for timetable grid rendering, view switching, and download functionality, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Timetable Grid Rendering Preservation**: Verify timetable grid displays correctly in both teacher-wise and class-wise views after fix
2. **View Switching Preservation**: Verify switching between views continues to work without errors
3. **Download Functionality Preservation**: Verify download button generates correct HTML file
4. **No Timetable Message Preservation**: Verify "No Timetable Generated" message displays when localStorage is empty
5. **Lesson Card Display Preservation**: Verify lesson cards show correct subject names, teacher/class details, and color coding

### Unit Tests

- Test `updateClassDistribution()` with various generatedTimetable structures (empty, partial, full)
- Test `updateTeacherDistribution()` with various generatedTimetable structures
- Test `getProgressBarColor()` with different percentage values (0%, 25%, 50%, 75%, 90%, 100%)
- Test edge cases: empty timetable, single class/teacher, all periods scheduled, no periods scheduled
- Test percentage calculation accuracy with different period counts

### Property-Based Tests

- Generate random timetable structures and verify distribution calculations are accurate
- Generate random class/teacher configurations and verify preservation of grid rendering
- Test that distribution updates don't affect timetable grid display across many scenarios
- Verify percentage calculations are always between 0 and 100 for any valid input

### Integration Tests

- Test full page load flow: localStorage → data load → grid render → distribution update
- Test view switching with distribution charts visible
- Test download functionality with distribution charts present
- Test that distribution charts update correctly when switching between views
- Test browser compatibility for distribution chart rendering
