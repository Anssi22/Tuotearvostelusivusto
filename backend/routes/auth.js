// backend/routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");

// Otetaan auth-middleware, joka tarkistaa JWT-tokenin
const auth = require("../middleware/auth");

// Rekisteröitymisreitti
router.post("/register", async (req, res) => {
    try {
        const { email, password} = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });
        const emailNorm = email.trim().toLowerCase();
        // Mongoon uusi käyttäjä
        const user = new User({ email: emailNorm, password });
        await user.save();
        // Luodaan JWT-token, koska se helpottaa backendin kuormaa
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(201).json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        if (err?.code === 11000) return res.status(409).json({ error: "Email already in use" }); // duplicate key [web:139]
        console.error("REGISTER ERROR:", err);
        return res.status(400).json({ error: "Registration failed" });
    }
});

// Kirjautumisreitti
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });
        const emailNorm = email.trim().toLowerCase();

        // Mongosta haetaan käyttä ja tarkistetaan salasana
        const user = await User.findOne({ email: emailNorm });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Nyt on väärä passu tai käyttis" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error("LOGIN ERROR:", err);      // ← lisää
        res.status(400).json({ error: err.message });
    }
});

// Palauta kirjautuneen käyttäjän tiedot
router.get("/me", auth, async (req, res) => {
    // '-password' = “älä sisällytä password-kenttää tulokseen”.
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

module.exports = router;
