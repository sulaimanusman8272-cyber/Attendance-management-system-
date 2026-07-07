const pool = require('../config/db');

// Student attendance percentage per course
const studentAttendanceReport = async (req, res) => {
    const { course_id } = req.params;
    const { institution_id } = req.user;

    try {
        const result = await pool.query(
            `SELECT
                u.id AS student_id,
                u.name,
                u.email,
                COUNT(DISTINCT s.id) AS total_sessions,
                COUNT(DISTINCT ar.session_id) AS attended_sessions,
                ROUND(
                    COUNT(DISTINCT ar.session_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
                ) AS attendance_percentage
             FROM enrollments e
             JOIN users u ON u.id = e.student_id
             JOIN attendance_sessions s ON s.course_id = e.course_id
             LEFT JOIN attendance_records ar ON ar.session_id = s.id AND ar.student_id = u.id
             WHERE e.course_id = $1
             GROUP BY u.id, u.name, u.email
             ORDER BY attendance_percentage ASC`,
            [course_id]
        );

        res.json({ report: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Defaulter list (students below 75% attendance)
const defaulterList = async (req, res) => {
    const { course_id } = req.params;
    const threshold = req.query.threshold || 75;

    try {
        const result = await pool.query(
            `SELECT
                u.id AS student_id,
                u.name,
                u.email,
                COUNT(DISTINCT s.id) AS total_sessions,
                COUNT(DISTINCT ar.session_id) AS attended_sessions,
                ROUND(
                    COUNT(DISTINCT ar.session_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
                ) AS attendance_percentage
             FROM enrollments e
             JOIN users u ON u.id = e.student_id
             JOIN attendance_sessions s ON s.course_id = e.course_id
             LEFT JOIN attendance_records ar ON ar.session_id = s.id AND ar.student_id = u.id
             WHERE e.course_id = $1
             GROUP BY u.id, u.name, u.email
             HAVING ROUND(
                COUNT(DISTINCT ar.session_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0) * 100, 2
             ) < $2
             ORDER BY attendance_percentage ASC`,
            [course_id, threshold]
        );

        res.json({ defaulters: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Course-wise summary for an institution
const courseSummary = async (req, res) => {
    const { institution_id } = req.user;

    try {
        const result = await pool.query(
            `SELECT
                c.id AS course_id,
                c.name AS course_name,
                c.code AS course_code,
                COUNT(DISTINCT e.student_id) AS total_students,
                COUNT(DISTINCT s.id) AS total_sessions
             FROM courses c
             LEFT JOIN enrollments e ON e.course_id = c.id
             LEFT JOIN attendance_sessions s ON s.course_id = c.id
             WHERE c.institution_id = $1
             GROUP BY c.id, c.name, c.code`,
            [institution_id]
        );

        res.json({ summary: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { studentAttendanceReport, defaulterList, courseSummary };
