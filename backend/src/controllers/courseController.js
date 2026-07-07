const pool = require('../config/db');

// Create a course (teacher/admin only)
const createCourse = async (req, res) => {
    const { name, code } = req.body;
    const { id: teacher_id, institution_id } = req.user;

    if (!name || !code) {
        return res.status(400).json({ message: 'Course name and code are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO courses (institution_id, teacher_id, name, code) VALUES ($1, $2, $3, $4) RETURNING *',
            [institution_id, teacher_id, name, code]
        );
        res.status(201).json({ message: 'Course created.', course: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Course code already exists.' });
        }
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Get all courses for the institution
const getCourses = async (req, res) => {
    const { institution_id, role, id: user_id } = req.user;

    try {
        let result;
        if (role === 'teacher') {
            result = await pool.query(
                'SELECT * FROM courses WHERE institution_id = $1 AND teacher_id = $2',
                [institution_id, user_id]
            );
        } else if (role === 'student') {
            result = await pool.query(
                `SELECT c.* FROM courses c
                 JOIN enrollments e ON e.course_id = c.id
                 WHERE e.student_id = $1`,
                [user_id]
            );
        } else {
            result = await pool.query(
                'SELECT * FROM courses WHERE institution_id = $1',
                [institution_id]
            );
        }
        res.json({ courses: result.rows });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Enroll a student in a course
const enrollStudent = async (req, res) => {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
        return res.status(400).json({ message: 'student_id and course_id are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
            [student_id, course_id]
        );
        res.status(201).json({ message: 'Student enrolled successfully.' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Student already enrolled.' });
        }
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

module.exports = { createCourse, getCourses, enrollStudent };
