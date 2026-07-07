# API Documentation
# Attendance Management System

**Base URL:** `http://localhost:5000/api`
**Auth:** Bearer Token (JWT) — pass in `Authorization: Bearer <token>` header

---

## Authentication

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "student",
  "institution_id": 1
}
```
**Roles:** `admin` | `teacher` | `student`

**Response 201:**
```json
{
  "message": "User registered successfully.",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "student" }
}
```

---

### POST /auth/login
Login and receive JWT token.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123",
  "institution_id": 1
}
```

**Response 200:**
```json
{
  "message": "Login successful.",
  "token": "<jwt_token>",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "student" }
}
```

---

## Courses

### POST /courses
Create a new course. *(Teacher, Admin only)*

**Body:**
```json
{ "name": "Data Structures", "code": "CS301" }
```

**Response 201:**
```json
{
  "message": "Course created.",
  "course": { "id": 1, "name": "Data Structures", "code": "CS301", "teacher_id": 2 }
}
```

---

### GET /courses
Get courses. *(All roles)*
- Teacher: returns own courses
- Student: returns enrolled courses
- Admin: returns all institution courses

**Response 200:**
```json
{ "courses": [ { "id": 1, "name": "Data Structures", "code": "CS301" } ] }
```

---

### POST /courses/enroll
Enroll a student in a course. *(Teacher, Admin only)*

**Body:**
```json
{ "student_id": 5, "course_id": 1 }
```

**Response 201:**
```json
{ "message": "Student enrolled successfully." }
```

---

## Attendance Sessions

### POST /sessions
Create an attendance session and generate QR token. *(Teacher, Admin only)*

**Body:**
```json
{ "course_id": 1, "duration_minutes": 2 }
```

**Response 201:**
```json
{
  "message": "Session created.",
  "session": {
    "id": 10,
    "course_id": 1,
    "qr_token": "550e8400-e29b-41d4-a716-446655440000",
    "expires_at": "2026-07-08T10:02:00.000Z",
    "created_at": "2026-07-08T10:00:00.000Z"
  }
}
```

---

### GET /sessions/course/:course_id
Get all sessions for a course. *(All roles)*

**Response 200:**
```json
{
  "sessions": [
    { "id": 10, "course_id": 1, "qr_token": "...", "expires_at": "...", "created_at": "..." }
  ]
}
```

---

## Attendance

### POST /attendance/mark
Student marks attendance by submitting QR token. *(Student only)*

**Body:**
```json
{ "qr_token": "550e8400-e29b-41d4-a716-446655440000" }
```

**Response 201:**
```json
{ "message": "Attendance marked successfully." }
```

**Error Cases:**
| Code | Message |
|------|---------|
| 404  | Invalid QR code |
| 410  | QR code has expired |
| 403  | You are not enrolled in this course |
| 409  | Attendance already marked for this session |

---

### GET /attendance/session/:session_id
Get all attendance records for a session. *(Teacher, Admin only)*

**Response 200:**
```json
{
  "attendance": [
    { "id": 3, "name": "Jane Smith", "email": "jane@example.com", "marked_at": "2026-07-08T10:01:30.000Z" }
  ]
}
```

---

## Reports

### GET /reports/course/:course_id/attendance
Student attendance percentage for a course. *(Teacher, Admin only)*

**Response 200:**
```json
{
  "report": [
    {
      "student_id": 5,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "total_sessions": 10,
      "attended_sessions": 8,
      "attendance_percentage": 80.00
    }
  ]
}
```

---

### GET /reports/course/:course_id/defaulters?threshold=75
Students below attendance threshold. *(Teacher, Admin only)*

**Query Params:** `threshold` (default: 75)

**Response 200:**
```json
{
  "defaulters": [
    {
      "student_id": 7,
      "name": "Bob Jones",
      "email": "bob@example.com",
      "total_sessions": 10,
      "attended_sessions": 5,
      "attendance_percentage": 50.00
    }
  ]
}
```

---

### GET /reports/summary
Course-wise summary for the institution. *(Admin only)*

**Response 200:**
```json
{
  "summary": [
    {
      "course_id": 1,
      "course_name": "Data Structures",
      "course_code": "CS301",
      "total_students": 30,
      "total_sessions": 10
    }
  ]
}
```

---

## Error Response Format

All errors follow this format:
```json
{ "message": "Human readable error message." }
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad request / missing fields |
| 401 | Unauthenticated |
| 403 | Unauthorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 410 | Gone (QR expired) |
| 500 | Server error |
