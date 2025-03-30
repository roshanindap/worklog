const express = require('express');
const { createWorkLog, getWorkLogs,updateWorkLog, deleteWorkLog,getSingleWorkLog } = require('../controllers/workLogController');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/worklogs
router.post('/', authMiddleware ,createWorkLog);

// PUT /api/worklogs/:work_log_id
// PUT /api/worklogs/:user_id/:work_log_id
router.put('/:user_id/:work_log_id', authMiddleware, updateWorkLog);



// GET /api/worklogs/:user_id
router.get('/:user_id', authMiddleware, getWorkLogs);

router.delete("/:user_id/:work_log_id", authMiddleware, deleteWorkLog);

router.get("/:user_id/:work_log_id", authMiddleware, getSingleWorkLog);

module.exports = router;