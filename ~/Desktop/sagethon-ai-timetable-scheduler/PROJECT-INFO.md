# 🎓 Sagethon - AI Powered Timetable Scheduler

## 📋 Project Overview

An intelligent timetable scheduling system designed for schools to efficiently manage teachers, classes, subjects, lessons, and timetables with AI-powered optimization.

## ✨ Features

### ✅ Implemented Features
- **Teacher Management**: Add, edit, and manage teacher information
- **Class Management**: Organize classes and student groups
- **Subject Management**: Define subjects and curriculum
- **Lesson Management**: Create and schedule lessons
- **Timetable Generation**: AI-powered automatic timetable generation with conflict detection
- **Timetable Viewing**: Interactive timetable display with filtering options
- **Bulk Import**: Import multiple lessons from text files
- **Data Persistence**: LocalStorage-based data storage

### 🔜 Upcoming Features
- **Teacher Substitute Management**: Manage teacher absences and assign substitutes (Design Complete)
- **Distribution Charts**: Visual analytics for lesson distribution
- **Export/Import**: Export timetables to PDF/Excel

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your system
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Navigate to the project directory:
```bash
cd ~/Desktop/sagethon-ai-timetable-scheduler
```

2. Install dependencies (if needed):
```bash
npm install
```

### Running the Application

1. Start the server:
```bash
node server.js
```

2. Open your browser and navigate to:
```
http://localhost:3000/
```

### Available Pages

- **Main Dashboard**: `http://localhost:3000/`
- **Generate Timetable**: `http://localhost:3000/generate-timetable.html`
- **View Timetable**: `http://localhost:3000/view-timetable.html`

## 📁 Project Structure

```
sagethon-ai-timetable-scheduler/
├── index.html                          # Main dashboard
├── generate-timetable.html             # Timetable generation page
├── view-timetable.html                 # Timetable viewing page
├── script.js                           # Main application logic
├── timetable-script-enhanced.js        # Enhanced timetable generation
├── view-timetable-script.js            # Timetable viewing logic
├── styles.css                          # Main styles
├── timetable-styles.css                # Timetable-specific styles
├── server.js                           # Node.js HTTP server
├── package.json                        # Project dependencies
└── README.md                           # Project documentation
```

## 🎯 How to Use

### 1. Add Teachers
- Click on "Teacher Management" card
- Add teacher names and details
- Save to database

### 2. Add Classes
- Click on "Class Management" card
- Define class names and sections
- Save to database

### 3. Add Subjects
- Click on "Subject Management" card
- Add subject names
- Save to database

### 4. Create Lessons
- Click on "Lesson Management" card
- Assign teacher, class, and subject
- Specify number of periods per week
- Save lessons

### 5. Generate Timetable
- Click on "Generate Timetable" card
- Select class and week
- Click "Generate Timetable"
- AI will automatically create conflict-free schedule

### 6. View Timetable
- Click on "View Timetable" card
- Select class and week
- View the generated timetable

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js (HTTP Server)
- **Storage**: Browser LocalStorage
- **Icons**: Font Awesome
- **Styling**: Custom CSS with responsive design

## 📊 Key Algorithms

### Timetable Generation Algorithm
- Conflict detection for teacher and class scheduling
- Random slot assignment with validation
- Retry mechanism for failed assignments
- Distribution optimization across days

## 🔧 Configuration

### Server Port
Default port is `3000`. To change:
1. Open `server.js`
2. Modify `const PORT = 3000;`
3. Restart the server

### Timetable Settings
- Days: Monday to Friday (5 days)
- Periods per day: 8 periods
- Customizable in code

## 📝 Data Format

### LocalStorage Keys
- `teachers`: Array of teacher objects
- `classes`: Array of class objects
- `subjects`: Array of subject objects
- `lessons`: Array of lesson objects
- `timetables`: Object containing generated timetables

## 🐛 Troubleshooting

### Server won't start
- Check if Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port in `server.js`

### Data not saving
- Check browser console for errors
- Ensure LocalStorage is enabled
- Clear browser cache and try again

### Timetable generation fails
- Verify all lessons have valid teacher, class, and subject
- Check for sufficient time slots
- Reduce number of lessons if conflicts persist

## 🤝 Contributing

This is a Sagethon project. For contributions or issues, please contact the project maintainer.

## 📄 License

This project is created for Sagethon educational purposes.

## 👨‍💻 Developer

Created for Sagethon by Arman

## 📞 Support

For support or questions, please refer to the project documentation or contact the development team.

---

**Last Updated**: May 1, 2026
**Version**: 1.0.0
**Status**: Active Development
