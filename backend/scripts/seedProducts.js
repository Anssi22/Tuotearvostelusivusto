// backend/scripts/seedProducts.js

// ---------------------------------
// tehdään nopea “seed”-tiedosto, joka lisää tuotteet MongoDB:hen kerralla insertMany()-metodilla ja ajetaan se node-komennolla.
// ---------------------------------

const mongoose = require("mongoose");
const Product = require("../models/Product");
const products = require("../testdata/products.seed.json");

const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function run() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI puuttuu .env-tiedostosta");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    try {
    // Tyhjennä ensin (helppo kehityksessä)
        await Product.deleteMany({});

        // Lisää uudet tuotteet yhdellä kertaa
        const inserted = await Product.insertMany(products);
        console.log(`✅ Seed ok: lisätty ${inserted.length} tuotetta`);
    } catch (err) {
        console.error("❌ Seed epäonnistui:", err.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

run();
