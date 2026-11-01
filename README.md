# 🎓 MCE Hassan - CSE Class & Timetable AI Assistant

**Malnad College of Engineering, Hassan**  
*Department of Computer Science and Engineering*  
**Tentative Timetable for III Semester (Academic Year 2026-27 - ODD Semester)**  
**Class: III Semester C S & Engg | Section: C | Room No.: EE301**

---

## 🌟 Overview

This is an intelligent, full-stack **AI Classroom, Timetable & Faculty Assistant** designed specifically for students and faculty of **III Semester CSE (Section C)** at **Malnad College of Engineering, Hassan**.

It answers all student questions about:
- 📍 **Where should I go right now?** (Dynamic classroom/lab calculation based on current time & day)
- ⏭️ **What is my next class?**
- 📅 **Day-by-day schedules** (Monday to Saturday, period by period)
- 👨‍🏫 **Faculty details** (Who teaches which subject/lab, designations, department)
- 🧪 **Laboratories & Venues** (CSLAB-4, Honeywell Lab, CSLAB-2, H/W Lab, SA101, CS305, etc.)
- 📊 **Batch-wise breakdown** for Friday Data Analytics with Excel & Data Visualization with Python (Batches B1–B4)
- ☕ **Break timings** (Morning tea break & Lunch interval)
- 🏛️ **College administration** (HOD: Dr. Ananda Babu J; Timetable Coordinators: Mr. Vinod A M, Mrs. Shobha Chandra)

---

## 🚀 How to Run

### Method 1: One-Click Launcher (Windows)
Double-click `start.bat`.  
This starts the local Python server and automatically opens `http://localhost:8000` in your web browser.

### Method 2: Python Web Server
Open terminal in this directory and run:
```powershell
py server.py 8000
```
Then visit: `http://localhost:8000`

### Method 3: Direct Browser (Zero-Install / Offline)
Double-click `index.html` to open it in Chrome, Edge, or Firefox.  
*(Works 100% offline with zero dependencies!)*

### Method 4: Terminal Command-Line Bot
Prefer chatting in the terminal / PowerShell? Run:
```powershell
py cli_bot.py
```

---

## 💬 Sample Questions You Can Ask

| Category | Example Question |
|---|---|
| **Live Location** | *"Where is my class right now?"* |
| **Upcoming Class** | *"What is my next class?"* |
| **Day Schedules** | *"What's the schedule for Tuesday?"* or *"Friday classes"* |
| **Faculty Info** | *"Who teaches Data Structures?"* or *"What subject does Mrs. Shruthi take?"* |
| **Lab Details** | *"Where is Unix Lab conducted?"* or *"Where is Honeywell Lab?"* |
| **Batches** | *"Which lab is for Excel batch B2?"* or *"Show Python batches"* |
| **Breaks** | *"When is lunch break?"* or *"When is the morning interval?"* |
| **Room Details** | *"What happens in Room EE301?"* or *"Where is SA101?"* |
| **Course Codes** | *"What is 25CS302?"* or *"Course code for Java"* |
| **Admin** | *"Who is our HOD?"* or *"Who are the timetable coordinators?"* |

---

## 🛠️ Project Structure

```
AI Chat bot/
├── index.html                 # Main web dashboard and chatbot interface
├── style.css                  # Responsive design, glassmorphism & typography
├── app.js                     # Client NLP processor, live period tracker & speech APIs
├── server.py                  # Zero-dependency Python HTTP server & REST APIs
├── chatbot_core.py            # Core Python reasoning engine with scored entity matching
├── cli_bot.py                 # Interactive terminal chatbot
├── start.bat                  # One-click Windows starter
├── data/
│   ├── timetable.json         # Complete structured timetable database
│   ├── timetable_data.js      # Embedded offline database for file:// protocol
│   └── timetable_image.png    # High-resolution original official signed document
└── README.md                  # Project documentation
```

---

## 💎 Key Features

1. **Dual AI Intelligence Engine**:
   - **Built-in Smart Engine**: Fast, 100% offline, zero-latency rule & time-aware engine that accurately parses natural language, synonyms, and time calculations without any API keys.
   - **Optional Gemini API Mode**: Easily plug in a Google Gemini API key in the UI settings for open-ended generative AI conversations grounded on this exact syllabus and timetable.
2. **Real-time Live Tracker & Time Machine**:
   - Computes current class, room, and countdown in real time.
   - Includes a **Time Simulator** to test what the bot outputs for any day and hour of the week.
3. **Interactive Visual Timetable Grid**:
   - Displays the complete official schedule matching the college notice board.
   - Highlights the currently active period in real time with green pulsing glow.
   - Clicking any class cell automatically asks the bot for full course & faculty details.
4. **Voice Input & Voice Readout (TTS)**:
   - Click the 🎙️ microphone icon to speak your questions using Web Speech API.
   - Click the 🔊 speaker icon to have answers read out loud.
5. **Searchable Directories**:
   - **Faculty Directory** with instant search filter.
   - **Classrooms & Labs Guide** with venue descriptions.
   - **Batch Guide** for Friday Excel & Python sessions.
   - **Official Document Viewer** to inspect the signed college timetable document.
