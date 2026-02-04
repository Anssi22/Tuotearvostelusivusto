// backend/models/Review.js

const mongoose = require("mongoose");

// Luodaan Review-skeema
const reviewSchema = new mongoose.Schema(
    {
    // Mihin tuotteeseen tämä arvostelu kuuluu
        productId: {
            type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId -tyyppi
            ref: "Product",                       // viittaa Product-malliin
            required: true,
            index: true,                          // nopeuttaa hakuja tyyliin Review.find({ productId })
        },

        // Kuka käyttäjä (JWT:stä) teki arvostelun
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",                          // viittaa User-malliin
            required: true,
            index: true,
        },

        // Tähtiarvio 1-5
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        // Vapaa tekstiarvio
        text: {
            type: String,
            required: true,
            trim: true,
        },

        // (Valinnainen) nimimerkki näytettäväksi UI:ssa.
        // HUOM: omistajuus EI perustu tähän, vaan userId:hen (tokenista).
        authorName: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
    // 3) createdAt / updatedAt automaattisesti
        timestamps: true,
    },
);

// Tehdään malli "Review"
module.exports = mongoose.model("Review", reviewSchema);
