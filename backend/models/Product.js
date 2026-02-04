// backend/models/Product.js

const mongoose = require("mongoose");

// Luodaan skeema: miltä Product-dokumentti näyttää tietokannassa.
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,        // kentän tyyppi
            required: true,      // pakollinen
            trim: true,          // poistaa alusta/lopusta välilyönnit
        },

        description: {
            type: String,
            default: "",         // jos ei anneta, tallennetaan tyhjä merkkijono
            trim: true,
        },

        // Kuva (URL). Ei pakollinen, mutta hyödyllinen jos haluat näyttää kuvan listassa.
        imageUrl: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
    // Kun timestamps on true, Mongoose lisää automaattisesti:
    // createdAt = milloin dokumentti luotiin
    // updatedAt = milloin dokumenttia muokattiin viimeksi
        timestamps: true,
    },
);

// Tehdään malli "Product".
module.exports = mongoose.model("Product", productSchema);
