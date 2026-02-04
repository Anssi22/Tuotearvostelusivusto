// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

// Middleware, joka varmistaa että käyttäjällä on voimassa oleva JWT-token
function auth(req, res, next) {
    // Haetaan Authorization-header (muodossa "Bearer TOKEN")
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Token missing" });

    try {
    // Tarkistetaan token ja puretaan siitä payload (mm. userId)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}

module.exports = auth;
