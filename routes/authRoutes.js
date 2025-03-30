const express = require("express");
const { register, login, getUser } = require("../controllers/authController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post('/register', upload.single('profile_image'), register);
router.post("/login", login);


router.get('/users', authMiddleware, getUser);
router.get('/users/:id', authMiddleware, getUser);

module.exports = router;