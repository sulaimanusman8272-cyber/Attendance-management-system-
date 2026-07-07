# Attendance Management System (SaaS)

A cloud-based SaaS attendance system for educational institutions using time-limited QR codes.

---

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Backend    | Node.js + Express        |
| Database   | PostgreSQL               |
| Web        | React.js + Vite          |
| Mobile     | React Native + Expo      |
| Deployment | Docker + docker-compose  |

---

## Run with Docker (Single Command)

```bash
docker-compose up --build
```

- Web Dashboard: http://localhost:3000
- Backend API:   http://localhost:5000

---

## Run Locally (Without Docker)

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

---

## Documentation

| File                        | Contents                          |
|-----------------------------|-----------------------------------|
| docs/ERD.md                 | Entity Relationship Diagram       |
| docs/API.md                 | Full API documentation            |
| docs/SYSTEM_DESIGN.md       | Architecture & system design      |
| docs/WORKFLOW.md            | Workflow & process diagrams       |
| backend/database/schema.sql | Full database schema              |

---

## Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── middleware/roleCheck.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── courseController.js
│   │   │   ├── sessionController.js
│   │   │   ├── attendanceController.js
│   │   │   └── reportController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── sessions.js
│   │   │   ├── attendance.js
│   │   │   └── reports.js
│   │   └── app.js
│   ├── database/schema.sql
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/Navbar.jsx
│   │   ├── components/PrivateRoute.jsx
│   │   ├── pages/Login.jsx
│   │   ├── pages/Dashboard.jsx
│   │   ├── pages/Courses.jsx
│   │   ├── pages/Sessions.jsx
│   │   └── pages/Reports.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── mobile/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.js
│   │   ├── navigation/AppNavigator.js
│   │   ├── components/Header.js
│   │   └── screens/
│   │       ├── LoginScreen.js
│   │       ├── HomeScreen.js
│   │       ├── CoursesScreen.js
│   │       ├── ScanQRScreen.js
│   │       └── AttendanceScreen.js
│   ├── App.js
│   └── package.json
├── docs/
│   ├── ERD.md
│   ├── API.md
│   ├── SYSTEM_DESIGN.md
│   └── WORKFLOW.md
└── docker-compose.yml
```

---

## Default Test Setup

After starting the system, register via API:

```bash
# 1. Create institution (direct DB insert)
INSERT INTO institutions (name, domain) VALUES ('My University', 'myuni.edu');

# 2. Register admin
POST /api/auth/register
{ "name": "Admin", "email": "admin@myuni.edu", "password": "admin123", "role": "admin", "institution_id": 1 }

# 3. Register teacher
POST /api/auth/register
{ "name": "Dr. Smith", "email": "smith@myuni.edu", "password": "teach123", "role": "teacher", "institution_id": 1 }

# 4. Register student
POST /api/auth/register
{ "name": "Jane Doe", "email": "jane@myuni.edu", "password": "student123", "role": "student", "institution_id": 1 }
```
