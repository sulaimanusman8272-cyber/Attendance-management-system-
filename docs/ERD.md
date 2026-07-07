# Entity Relationship Diagram (ERD)
# Attendance Management System

## Tables & Relationships

```
+------------------+         +------------------+         +------------------+
|   institutions   |         |      users        |         |     courses      |
+------------------+         +------------------+         +------------------+
| PK id            |<---+    | PK id            |    +--->| PK id            |
|    name          |    |    | FK institution_id |    |    | FK institution_id|
|    domain        |    +----| FK (institution) |    |    | FK teacher_id    |
|    created_at    |         |    name          |    |    |    name          |
+------------------+         |    email         |    |    |    code          |
                             |    password_hash |    |    |    created_at    |
                             |    role          |    |    +------------------+
                             |    created_at    |    |             |
                             +------------------+    |             |
                                      |             |             |
                                      |             |    +------------------+
                                      |             |    |   enrollments    |
                                      |             |    +------------------+
                                      |             |    | PK id            |
                                      |             |    | FK student_id    |
                                      +------------>|--->| FK course_id     |
                                      |             |    |    enrolled_at   |
                                      |             |    +------------------+
                                      |             |
                                      |    +------------------------+
                                      |    |  attendance_sessions   |
                                      |    +------------------------+
                                      |    | PK id                  |
                                      |    | FK course_id    <------+
                                      |    | FK teacher_id          |
                                      +--->|    (users)             |
                                      |    |    qr_token            |
                                      |    |    expires_at          |
                                      |    |    created_at          |
                                      |    +------------------------+
                                      |                |
                                      |    +------------------------+
                                      |    |  attendance_records    |
                                      |    +------------------------+
                                      |    | PK id                  |
                                      |    | FK session_id   <------+
                                      |    | FK student_id          |
                                      +--->|    (users)             |
                                           |    marked_at           |
                                           +------------------------+
```

## Relationships Summary

| Relationship                        | Type       | Description                                  |
|-------------------------------------|------------|----------------------------------------------|
| institutions → users                | One-to-Many | One institution has many users               |
| institutions → courses              | One-to-Many | One institution has many courses             |
| users (teacher) → courses           | One-to-Many | One teacher owns many courses                |
| users (student) → enrollments       | One-to-Many | One student can enroll in many courses       |
| courses → enrollments               | One-to-Many | One course has many enrolled students        |
| courses → attendance_sessions       | One-to-Many | One course has many attendance sessions      |
| users (teacher) → attendance_sessions | One-to-Many | One teacher creates many sessions          |
| attendance_sessions → attendance_records | One-to-Many | One session has many attendance records |
| users (student) → attendance_records | One-to-Many | One student has many attendance records     |

## Unique Constraints (Business Rules)

| Table                | Unique Constraint              | Purpose                                      |
|----------------------|-------------------------------|----------------------------------------------|
| users                | (email, institution_id)        | Same email allowed in different institutions |
| courses              | (code, institution_id)         | Same course code allowed in different institutions |
| enrollments          | (student_id, course_id)        | Student cannot enroll in the same course twice |
| attendance_sessions  | qr_token                       | Each QR token is globally unique             |
| attendance_records   | (session_id, student_id)       | Student cannot mark attendance twice per session |

## Role-Based Access

| Role    | Permissions                                                       |
|---------|-------------------------------------------------------------------|
| admin   | All access: manage users, courses, sessions, view all reports    |
| teacher | Create courses, create sessions, view attendance, view reports   |
| student | View enrolled courses, scan QR to mark attendance               |
