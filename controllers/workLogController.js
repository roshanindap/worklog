const pool = require('../config/db');

const createWorkLog = async (req, res) => {
    const { user_id, title, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO work_logs (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
            [user_id, title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getWorkLogs = async (req, res) => {
    const { user_id } = req.params;
    const { page = 1, limit = 12 } = req.query; // Default to page 1, 12 items per page

    try {
        // First query to get total count
        const countQuery = await pool.query(
            'SELECT COUNT(*) FROM work_logs WHERE user_id = $1',
            [user_id]
        );
        const total = parseInt(countQuery.rows[0].count);

        // Second query to get paginated results
        const offset = (page - 1) * limit;
        const result = await pool.query(
            'SELECT * FROM work_logs WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
            [user_id, limit, offset]
        );

        res.status(200).json({
            worklogs: result.rows,
            totalCount: total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            itemsPerPage: parseInt(limit)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateWorkLog = async (req, res) => {
    const { user_id, work_log_id } = req.params;
    const { title, description } = req.body;

    try {
        const result = await pool.query(
            'UPDATE work_logs SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [title, description, work_log_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Work log not found or does not belong to the user' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const deleteWorkLog = async (req, res) => {
    const { user_id, work_log_id } = req.params;

    try {
        // Ensure that the worklog belongs to the given user before deleting
        const result = await pool.query(
            "DELETE FROM work_logs WHERE id = $1 AND user_id = $2 RETURNING *",
            [work_log_id, user_id]
        );

        // Check if the worklog exists and belongs to the user
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Worklog not found or does not belong to this user" });
        }

        res.status(200).json({ message: "Worklog deleted successfully" });
    } catch (err) {
        console.error("Error deleting worklog:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getSingleWorkLog = async (req, res) => {
    const { user_id, work_log_id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM work_logs WHERE user_id = $1 AND id = $2 LIMIT 1',
            [user_id, work_log_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Work log not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createWorkLog, getWorkLogs, updateWorkLog, deleteWorkLog, getSingleWorkLog};
