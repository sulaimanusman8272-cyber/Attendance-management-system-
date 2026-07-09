const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Create an attendance session and generate QR token
const createSession = async (req, res) => {
    const { course_id, duration_minutes = 2 } = req.body;
    const { id: teacher_id } = req.user;

    if (!course_id) {
        return res.status(400).json({ message: 'course_id is required.' });
    }

    try {
        const qr_token = uuidv4();
        const expires_at = new Date(Date.now() + duration_minutes * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO attendance_sessions (course_id, teacher_id, qr_token, expires_at)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [course_id, teacher_id, qr_token, expires_at]
        );

        const session = result.rows[0];
        res.status(201).json({
            message: 'Session created.',
            session: {
                id: session.id,
                course_id: session.course_id,
                qr_token: session.qr_token,
                expires_at: session.expires_at,
                created_at: session.created_at
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all sessions for a course (with teacher name and present count)
const getSessionsByCourse = async (req, res) => {
    const { course_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT s.*, u.name AS teacher_name, COUNT(ar.id) AS present_count
             FROM attendance_sessions s
             LEFT JOIN users u ON u.id = s.teacher_id
             LEFT JOIN attendance_records ar ON ar.session_id = s.id
             WHERE s.course_id = $1
             GROUP BY s.id, u.name
             ORDER BY s.created_at DESC`,
            [course_id]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all sessions across all courses for admin
const getAllSessions = async (req, res) => {
    const { institution_id } = req.user;

    try {
        const result = await pool.query(
            `SELECT s.*, c.name AS course_name, c.code AS course_code,
             u.name AS teacher_name, COUNT(ar.id) AS present_count
             FROM attendance_sessions s
             JOIN courses c ON c.id = s.course_id
             LEFT JOIN users u ON u.id = s.teacher_id
             LEFT JOIN attendance_records ar ON ar.session_id = s.id
             WHERE c.institution_id = $1
             GROUP BY s.id, c.name, c.code, u.name
             ORDER BY s.created_at DESC`,
            [institution_id]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { createSession, getSessionsByCourse, getAllSessions };
