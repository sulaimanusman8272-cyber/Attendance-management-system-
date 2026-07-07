# Workflow Diagrams
# Attendance Management System

---

## 1. Admin Workflow

```
Admin Logs In
     |
     v
Dashboard (stats overview)
     |
     +---> Manage Courses
     |         |
     |         +---> Create new course (name + code)
     |         +---> Enroll students into courses
     |         +---> View all courses
     |
     +---> View Reports
               |
               +---> Select course
               +---> View attendance % per student
               +---> View defaulter list (below 75%)
               +---> View course-wise summary
```

---

## 2. Teacher Workflow

```
Teacher Logs In
     |
     v
Dashboard
     |
     +---> My Courses
     |         |
     |         +---> View own courses
     |         +---> Enroll students
     |
     +---> Sessions
     |         |
     |         +---> Select course
     |         +---> Click "Generate QR"
     |         |         |
     |         |         v
     |         |    [QR Code displayed on screen]
     |         |    [2-minute countdown timer]
     |         |    [Students scan → attendance recorded]
     |         |
     |         +---> View past sessions & status
     |
     +---> Reports
               |
               +---> Attendance % per student
               +---> Defaulter list
```

---

## 3. Student Workflow (Mobile App)

```
Student Opens App
     |
     v
Login Screen
(institution ID + email + password)
     |
     v
Home Screen (Dashboard)
     |
     +---> My Courses tab
     |         |
     |         +---> View enrolled courses
     |
     +---> Scan QR tab  <--- [MAIN ACTION]
     |         |
     |         v
     |    Camera opens
     |         |
     |         v
     |    Point at QR code shown by teacher
     |         |
     |         v
     |    Backend validates:
     |    1. QR token valid?
     |    2. Not expired?
     |    3. Student enrolled?
     |    4. Not already marked?
     |         |
     |    +----+----+
     |    |         |
     |  SUCCESS   FAILURE
     |    |         |
     |  Green     Red X
     |  check     + reason
     |
     +---> Attendance tab
               |
               +---> Select course
               +---> View own attendance %
               +---> See progress bar
               +---> Defaulter warning if < 75%
```

---

## 4. QR Code Lifecycle

```
[Teacher clicks "Generate QR"]
         |
         v
Backend creates:
- Unique UUID token
- expires_at = now + 2 minutes
- Saved in attendance_sessions table
         |
         v
[QR code rendered on web dashboard]
[Countdown timer starts: 2:00 → 0:00]
         |
         v
Students scan within 2 minutes
         |
         v
[Timer reaches 0:00]
[QR marked as expired — no more scanning]
         |
         v
Teacher can generate new QR for same course
```

---

## 5. Attendance Validation Rules

```
Student submits QR token
         |
         v
Rule 1: Does qr_token exist in DB?
         |
     NO --→ 404 "Invalid QR code"
         |
        YES
         |
         v
Rule 2: Is expires_at in the future?
         |
     NO --→ 410 "QR code has expired"
         |
        YES
         |
         v
Rule 3: Is student enrolled in session's course?
         |
     NO --→ 403 "Not enrolled in this course"
         |
        YES
         |
         v
Rule 4: Has student already marked for this session?
         |
    YES --→ 409 "Attendance already marked"
         |
        NO
         |
         v
[INSERT into attendance_records]
[Return 201 "Attendance marked successfully"]
```

---

## 6. Reporting Flow

```
Teacher/Admin selects course
         |
         v
Backend query:
- For each enrolled student
- Count total sessions in course
- Count sessions where student has record
- Calculate: (attended / total) * 100
         |
         v
Results sorted by percentage (lowest first)
         |
         v
Defaulters = students where percentage < 75%
         |
         v
Displayed in table with progress bars
```
