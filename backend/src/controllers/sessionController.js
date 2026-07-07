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

// Get all sessions for a course
const getSessionsByCourse = async (req, res) => {
    const { course_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM attendance_sessions WHERE course_id = $1 ORDER BY created_at DESC',
            [course_id]
        );
        res.json({ sessions: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { createSession, getSessionsByCourse };
