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

        // Kuva polku, joka tallennetaan tietokantaan. Esim. "/uploads/kuva123.jpg"
        imagePath: { type: String, default: "", trim: true },
        ownerId: { type: String, required: true }, // tai mongoose.Schema.Types.ObjectId jos käytät sitä userId:lle
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
