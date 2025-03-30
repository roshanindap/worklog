const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register a new user
const register = async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    const profile_image = req.file ? req.file.path : null;

    try {
        // Check if user exists
        const userExists = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (email, password, first_name, last_name, profile_image) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, first_name, last_name, profile_image`,
            [email, hashedPassword, first_name, last_name, profile_image]
        );

        res.status(201).json({
            success: true,
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({
            success: false,
            error: "Registration failed"
        });
    }
};

// Login an existing user
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const user = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password: _, ...userData } = user;

        res.status(200).json({
            success: true,
            token,
            user: userData
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({
            success: false,
            error: "Login failed"
        });
    }
};

//  user getter
const getUser = async (req, res) => {
    try {
        const requestedId = req.params.id ? Number(req.params.id) : Number(req.user.id);
        const authUserId = Number(req.user.id);

        console.log(`Requested: ${requestedId}, Authenticated: ${authUserId}`); // Debug log

        // Ensure users can only fetch their own profile
        if (requestedId !== authUserId) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized access to other user's data",
            });
        }

        // Fetch user details from the database
        const result = await pool.query(
            `SELECT id, email, first_name, last_name, profile_image FROM users WHERE id = $1`,
            [requestedId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0],
        });

    } catch (err) {
        console.error("Error in getUser:", err);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
        });
    }
};

module.exports = {
    register,
    login,
    getUser
};