// backend/routes/products.js

// Tehdään Express Router, jotta reitit voidaan pitää omassa tiedostossa
const router = require("express").Router();
// Auth-middleware: vaatii validin JWT-tokenin (asettaa req.userId)
const auth = require("../middleware/auth");
// Mongoose-mallit
const Product = require("../models/Product");
const Review = require("../models/Review");


// ------------------------------------------------------------
// HAE TUOTTEET JA NIIDEN ARVOSTELUT
// Palauttaa kaikki tuotteet, ja liittää jokaiseen tuotteeseen sen arvostelut,
// jotta frontin "loadProducts()" riittää näyttämään kaiken yhdellä pyynnöllä.
// ------------------------------------------------------------
router.get("/products", async (req, res) => {
    // 1) Haetaan kaikki tuotteet.
    // .lean() palauttaa JavaScript -objekteja, ei Mongoose-dokumentteja (kevempää)
    const products = await Product.find().lean();
    // 2) Kerätään tuotteiden id:t talteen, jotta voidaan hakea kaikki niiden arvostelut yhdellä haulla
    const productIds = products.map(p => p._id);
    // 3) Haetaan kaikki arvostelut, joiden productId on jonkin tuotteen id
    const reviews = await Review.find({ productId: { $in: productIds } }).lean();

    // 4) Rakennetaan Map, jossa avain = productId stringinä ja arvo = lista arvosteluista
    // Tämä tekee "ryhmittelyn" tuotteittain.
    const byProduct = new Map();
    for (const r of reviews) {
        const key = String(r.productId);
        byProduct.set(key, (byProduct.get(key) || []).concat(r));
    }
    // 5) Tehdään lopullinen lista tuotteista, joihin lisätään reviews-kenttä
    const result = products.map(p => ({
        ...p,
        reviews: byProduct.get(String(p._id)) || [],
    }));
    res.json(result);
});


// ------------------------------------------------------------
// LISÄÄ ARVOSTELU TUOTTEESEEN
// Vaatii auth-middlewarea, jotta saadaan kirjautuneen käyttäjän id (req.userId).
// Route-parametrit (kuten :productId) löytyvät req.params-oliosta.
// ------------------------------------------------------------
router.post("/products/:productId/reviews", auth, async (req, res) => {
    // Otetaan pyynnön body:sta arvostelun data
    const { arvosteluNumero, arvosteluTeksti, nimimerkki } = req.body;

    // Luodaan uusi Review-dokumentti MongoDB:hen
    const created = await Review.create({
        productId: req.params.productId, // URL:sta tuleva productId
        userId: req.userId,              // tokenista (auth middleware asetti)
        arvosteluNumero,
        arvosteluTeksti,
        nimimerkki, // valinnainen "nimimerkki" UI:ta varten (ei vaikuta omistajuuteen)
    });

    res.status(201).json(created);
});


// ------------------------------------------------------------
// MUOKKAA ARVOSTELUA   
// Vain arvostelun omistaja saa muokata (review.userId täytyy matchata req.userId).
// Lisäksi tarkistetaan, että arvostelu kuuluu juuri tuohon productId:hen,
// koska frontti lähettää molemmat id:t URL:ssa.
// ------------------------------------------------------------
router.put("/products/:productId/reviews/:reviewId", auth, async (req, res) => {
    // Haetaan arvostelu id:llä
    const reviewId = req.params.reviewId;
    const productId = req.params.productId;
    // const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) return res.sendStatus(404);

    // Varmistetaan että arvostelu kuuluu siihen productiin, jota URL väittää
    if (String(review.productId) !== productId) return res.sendStatus(404);

    // Omistajuustarkistus: vain se käyttäjä, joka loi arvostelun, saa muokata
    if (String(review.userId) !== user) return res.sendStatus(403);

    // Päivitetään vain jos uudet arvot annettiin (?? pitää vanhan jos undefined)
    review.arvosteluNumero = req.body.arvosteluNumero ?? review.arvosteluNumero;
    review.arvosteluTeksti = req.body.arvosteluTeksti ?? review.arvosteluTeksti;
    // review.nimimerkki = req.body.nimimerkki ?? review.nimimerkki; // jos haluat sallia nimimerkin vaihdon

    // Tallennetaan muutokset tietokantaan
    await review.save();

    res.json(review);
});

// ------------------------------------------------------------
// POISTAA ARVOSTELUN
// Vain omistaja saa poistaa.
// 204 No Content = poistettiin onnistuneesti, ei palauteta bodya. [web:190]
// ------------------------------------------------------------
router.delete("/products/:productId/reviews/:reviewId", auth, async (req, res) => {

    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.sendStatus(404);

    if (String(review.productId) !== req.params.productId) return res.sendStatus(404);

    if (String(review.userId) !== req.userId) return res.sendStatus(403);

    // Poisto tietokannasta
    await review.deleteOne();

    res.sendStatus(204);
});

module.exports = router;
