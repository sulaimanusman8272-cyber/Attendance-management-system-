const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const register = async (req, res) => {
    const { name, email, password, role, institution_id } = req.body;

    if (!name || !email || !password || !role || !institution_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role.' });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND institution_id = $2',
            [email, institution_id]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (institution_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [institution_id, name, email, password_hash, role]
        );

        res.status(201).json({ message: 'User registered successfully.', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Login
const login = async (req, res) => {
    const { email, password, institution_id } = req.body;

    if (!email || !password || !institution_id) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND institution_id = $2',
            [email, institution_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, institution_id: user.institution_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful.',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, institution_id: user.institution_id }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// Signup - create a new institution and admin account
const signup = async (req, res) => {
    const { institution_name, institution_domain, admin_name, admin_email, admin_password } = req.body;

    if (!institution_name || !institution_domain || !admin_name || !admin_email || !admin_password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existingDomain = await client.query(
            'SELECT id FROM institutions WHERE domain = $1',
            [institution_domain.toLowerCase()]
        );
        if (existingDomain.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'An institution with this domain already exists.' });
        }

        const instResult = await client.query(
            'INSERT INTO institutions (name, domain) VALUES ($1, $2) RETURNING id, name',
            [institution_name, institution_domain.toLowerCase()]
        );
        const institution = instResult.rows[0];

        const password_hash = await bcrypt.hash(admin_password, 10);
        const userResult = await client.query(
            'INSERT INTO users (institution_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
            [institution.id, admin_name, admin_email, password_hash, 'admin']
        );
        const user = userResult.rows[0];

        await client.query('COMMIT');

        const token = jwt.sign(
            { id: user.id, role: user.role, institution_id: institution.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Institution and admin account created successfully.',
            institution_id: institution.id,
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, institution_id: institution.id }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Server error.', error: err.message });
    } finally {
        client.release();
    }
};

module.exports = { register, login, signup };
