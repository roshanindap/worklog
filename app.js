require("dotenv").config(); // Load environment variables at the top

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const workLogRoutes = require("./routes/workLogRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (e.g., uploaded images)
app.use("/uploads", express.static("uploads"));
app.use(cors({
    origin: '*',  // Allow all domains
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the API!");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/worklogs", workLogRoutes);

module.exports = app; // Export app only
