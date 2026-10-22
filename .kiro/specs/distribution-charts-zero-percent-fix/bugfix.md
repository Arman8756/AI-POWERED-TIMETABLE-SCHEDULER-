# Bugfix Requirements Document

## Introduction

This document addresses a bug in the timetable viewing functionality where distribution charts incorrectly display "0 / 48 periods (0.0%)" for all classes and teachers on the view-timetable.html page, despite a timetable being successfully generated with scheduled lessons. The bug prevents users from seeing the actual period allocation statistics, which are critical for understanding workload distribution across classes and teachers.

The root cause is that while the generated timetable data is correctly stored in localStorage and rendered in the timetable grid, the view-timetable-script.js file lacks the logic to calculate and display period distribution statistics. The distribution calculation functions exist in timetable-script.js but are not available or invoked in the view-timetable.html context.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to view-timetable.html after generating a timetable THEN the "Class Period Distribution" section displays "0 / 48 periods (0.0%)" for all classes

1.2 WHEN a user navigates to view-timetable.html after generating a timetable THEN the "Teacher Period Distribution" section displays "0 / 48 periods (0.0%)" for all teachers

1.3 WHEN the view-timetable-script.js loads timetable data from localStorage THEN it renders the timetable grid correctly but does not calculate or update distribution statistics

1.4 WHEN distribution chart HTML elements exist in view-timetable.html THEN they remain unpopulated with actual data because no calculation logic is executed

### Expected Behavior (Correct)

2.1 WHEN a user navigates to view-timetable.html after generating a timetable THEN the "Class Period Distribution" section SHALL display the actual number of scheduled periods for each class with correct percentages (e.g., "12 / 48 periods (25.0%)")

2.2 WHEN a user navigates to view-timetable.html after generating a timetable THEN the "Teacher Period Distribution" section SHALL display the actual number of scheduled periods for each teacher with correct percentages (e.g., "16 / 48 periods (33.3%)")

2.3 WHEN the view-timetable-script.js loads timetable data from localStorage THEN it SHALL calculate period distribution by counting scheduled lessons from the generatedTimetable object and update the distribution chart displays

2.4 WHEN distribution calculations are performed THEN they SHALL iterate through the classWise and teacherWise data structures in the generatedTimetable object to count actual scheduled periods

2.5 WHEN distribution percentages are calculated THEN they SHALL use the formula: (scheduled_periods / total_periods_per_week) × 100, where total_periods_per_week = periods_per_day × working_days (8 × 6 = 48)

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user navigates to view-timetable.html and no timetable has been generated THEN the system SHALL CONTINUE TO display the "No Timetable Generated" message

3.2 WHEN the timetable grid is rendered in teacher-wise view THEN the system SHALL CONTINUE TO display all teachers with their scheduled lessons correctly positioned by day and period

3.3 WHEN the timetable grid is rendered in class-wise view THEN the system SHALL CONTINUE TO display all classes with their scheduled lessons correctly positioned by day and period

3.4 WHEN a user switches between teacher-wise and class-wise views THEN the system SHALL CONTINUE TO re-render the timetable grid without errors

3.5 WHEN a user clicks the download button THEN the system SHALL CONTINUE TO generate and download the timetable as an HTML file

3.6 WHEN the generatedTimetable object structure contains classWise, teacherWise, days, and periods properties THEN the system SHALL CONTINUE TO use this structure for rendering the timetable grid

3.7 WHEN lesson cards are displayed in the timetable grid THEN the system SHALL CONTINUE TO show subject names, teacher/class details, and color coding correctly
