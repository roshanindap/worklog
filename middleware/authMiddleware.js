const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Get token from Authorization header
        const authHeader = req.header("Authorization");

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "Authorization header missing",
            });
        }

        // 2. Extract token from "Bearer <token>"
        const token = authHeader.split(" ")[1]; // Ensure it's properly formatted

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Malformed token",
            });
        }

        // 3. Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach decoded user info to request
        req.user = decoded;

        console.log("Authenticated user:", req.user); // Debugging log
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        let errorMessage = "Invalid token";
        if (error.name === "TokenExpiredError") {
            errorMessage = "Token expired";
        }

        return res.status(401).json({
            success: false,
            error: errorMessage,
        });
    }
};

module.exports = authMiddleware;
