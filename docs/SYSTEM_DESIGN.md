# System Design Document
# Attendance Management System (SaaS)

---

## 1. Architecture Overview

```
+---------------------------+        +---------------------------+
|     Web Dashboard         |        |     Mobile App            |
|  (React.js - Port 3000)   |        |  (React Native / Expo)    |
+---------------------------+        +---------------------------+
            |                                    |
            |  HTTP REST API (JSON)              |
            v                                    v
+---------------------------------------------------+
|              Backend API Server                   |
|         (Node.js + Express - Port 5000)           |
|                                                   |
|  /api/auth       - Authentication & JWT           |
|  /api/courses    - Course management              |
|  /api/sessions   - QR session management          |
|  /api/attendance - Attendance marking             |
|  /api/reports    - Reports & analytics            |
+---------------------------------------------------+
                         |
                         | SQL Queries (pg driver)
                         v
+---------------------------------------------------+
|              PostgreSQL Database                  |
|                 (Port 5432)                       |
|                                                   |
|  institutions | users | courses | enrollments     |
|  attendance_sessions | attendance_records         |
+---------------------------------------------------+

All services run inside Docker containers via docker-compose.
```

---

## 2. Multi-Tenant Architecture

Each institution is isolated by `institution_id`:
- All users, courses, and data belong to an institution
- Login requires institution ID — data is never mixed between institutions
- Same email can exist in multiple institutions (different accounts)

```
Institution A                Institution B
+-----------+               +-----------+
| Users     |               | Users     |
| Courses   |               | Courses   |
| Sessions  |               | Sessions  |
+-----------+               +-----------+
        \                       /
         +-------+-------+
                 |
           [Shared DB]
        (isolated by institution_id)
```

---

## 3. QR Code Attendance Workflow

```
TEACHER                         STUDENT
  |                                 |
  |  1. Opens Sessions page         |
  |  2. Selects course              |
  |  3. Clicks "Generate QR"        |
  |                                 |
  |--- POST /sessions ------------->|
  |<-- Returns {qr_token, expires_at}
  |                                 |
  |  4. QR code displayed on screen |
  |     (countdown timer: 2 min)    |
  |                                 |
  |                  5. Student opens mobile app
  |                  6. Taps "Scan QR"
  |                  7. Points camera at QR
  |                                 |
  |<---- POST /attendance/mark -----+
  |       {qr_token: "uuid..."}     |
  |                                 |
  |  Backend validates:             |
  |  a) QR token exists?            |
  |  b) QR not expired?             |
  |  c) Student enrolled in course? |
  |  d) Not already marked?         |
  |                                 |
  |-----> 201 "Attendance marked" ->+
  |    OR error with reason         |
  |                                 |
  |  8. Green checkmark on phone    |
  |  9. Record saved in DB          |
```

---

## 4. Authentication Flow

```
User                     Backend                  Database
 |                          |                         |
 |-- POST /auth/login ------>|                         |
 |   {email, password,       |                         |
 |    institution_id}        |                         |
 |                          |-- SELECT user WHERE ---->|
 |                          |   email + institution_id |
 |                          |<-- user row -------------|
 |                          |                         |
 |                          |-- bcrypt.compare()      |
 |                          |   (password vs hash)    |
 |                          |                         |
 |                          |-- jwt.sign()            |
 |                          |   {id, role,            |
 |                          |    institution_id}      |
 |                          |                         |
 |<-- 200 {token, user} ----|                         |
 |                          |                         |
 |  (token stored in        |                         |
 |   localStorage/          |                         |
 |   AsyncStorage)          |                         |
 |                          |                         |
 |-- GET /courses ---------->|                         |
 |   Authorization: Bearer  |                         |
 |   <token>                |-- jwt.verify() -------> |
 |                          |-- SELECT courses ------->|
 |<-- 200 {courses} --------|                         |
```

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Web Frontend | React.js 18 + Vite | Teacher/Admin dashboard |
| Mobile App | React Native + Expo | Student QR scanning |
| Backend API | Node.js + Express | REST API server |
| Database | PostgreSQL 15 | Relational data storage |
| Auth | JWT (jsonwebtoken) | Stateless authentication |
| Password | bcryptjs | Secure password hashing |
| QR Generation | qrcode.react | Web QR display |
| QR Scanning | expo-camera | Mobile camera scanning |
| Containerization | Docker + docker-compose | Single-command deployment |
| Web Server | Nginx | Frontend serving + API proxy |

---

## 6. Security Measures

| Threat | Mitigation |
|---|---|
| Password theft | bcrypt hashing with salt rounds = 10 |
| Unauthorized API access | JWT required on all protected routes |
| Role escalation | Role-based middleware on every route |
| QR code reuse | UUID tokens expire after 2 minutes |
| Double attendance | UNIQUE constraint on (session_id, student_id) |
| Cross-institution access | institution_id embedded in JWT, validated in queries |
| SQL injection | Parameterized queries (pg driver) |

---

## 7. Database Schema

```sql
institutions   (id, name, domain, created_at)
users          (id, institution_id, name, email, password_hash, role, created_at)
courses        (id, institution_id, teacher_id, name, code, created_at)
enrollments    (id, student_id, course_id, enrolled_at)
attendance_sessions  (id, course_id, teacher_id, qr_token, expires_at, created_at)
attendance_records   (id, session_id, student_id, marked_at)
```

---

## 8. Deployment (Docker)

```
docker-compose up --build
```

Starts 3 containers:
1. `attendance_db` — PostgreSQL on port 5432 (auto-creates schema)
2. `attendance_backend` — Node.js API on port 5000
3. `attendance_frontend` — Nginx serving React on port 3000

All containers are networked together internally. Only ports 3000 and 5000 are exposed externally.
