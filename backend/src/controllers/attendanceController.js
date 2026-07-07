const pool = require('../config/db');

// Student marks attendance by submitting QR token
const markAttendance = async (req, res) => {
    const { qr_token } = req.body;
    const { id: student_id } = req.user;

    if (!qr_token) {
        return res.status(400).json({ message: 'qr_token is required.' });
    }

    try {
        // Find the session
        const sessionResult = await pool.query(
            'SELECT * FROM attendance_sessions WHERE qr_token = $1',
            [qr_token]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid QR code.' });
        }

        const session = sessionResult.rows[0];

        // Check if QR is expired
        if (new Date() > new Date(session.expires_at)) {
            return res.status(410).json({ message: 'QR code has expired.' });
        }

        // Check if student is enrolled in the course
        const enrollmentResult = await pool.query(
            'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [student_id, session.course_id]
        );

        if (enrollmentResult.rows.length === 0) {
            return res.status(403).json({ message: 'You are not enrolled in this course.' });
        }

        // Check if already marked
        const alreadyMarked = await pool.query(
            'SELECT id FROM attendance_records WHERE session_id = $1 AND student_id = $2',
            [session.id, student_id]
        );

        if (alreadyMarked.rows.length > 0) {
            return res.status(409).json({ message: 'Attendance already marked for this session.' });
        }

        // Mark attendance
        await pool.query(
            'INSERT INTO attendance_records (session_id, student_id) VALUES ($1, $2)',
            [session.id, student_id]
        );

        res.status(201).json({ message: 'Attendance marked successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get attendance records for a session
const getAttendanceBySession = async (req, res) => {
    const { session_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, ar.marked_at
             FROM attendance_records ar
             JOIN users u ON u.id = ar.student_id
             WHERE ar.session_id = $1`,
            [session_id]
        );
        res.json({ attendance: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { markAttendance, getAttendanceBySession };
