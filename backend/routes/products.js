// backend/routes/products.js

// Tehdään Express Router, jotta reitit voidaan pitää omassa tiedostossa
const router = require("express").Router();
// Auth-middleware: vaatii validin JWT-tokenin (asettaa req.userId)
const auth = require("../middleware/auth");
// Mongoose-mallit
const Product = require("../models/Product");
const Review = require("../models/Review");

const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Multer-asetukset tiedostolatauksille (kuvat)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ? ext : "";
        const name = crypto.randomBytes(16).toString("hex") + (safeExt || "");
        cb(null, name);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});


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
    console.log(`nämä tuotteet: ${JSON.stringify(result, null, 2)}`
);
    res.json(result);
});



// ------------------------------------------------------------
// LISÄÄ TUOTE (VAATII KIRJAUTUMISEN)
// ------------------------------------------------------------
// middlewaret: auth = vaatii tokenin, upload.single("image") = odottaa "image"-kentässä olevan tiedoston
router.post("/products", auth, upload.single("image"), async (req, res) => {
    const { name, description } = req.body;

    if (!name || !String(name).trim()) {
        return res.status(400).json({ error: "name is required" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const created = await Product.create({
        ownerId: req.userId,
        name: String(name).trim(),
        description: String(description || "").trim(),
        imagePath,
    });

    res.status(201).json(created);
});


// ------------------------------------------------------------
// Päivitä tuotetta (VAATII KIRJAUTUMISEN)
// Vain tuotteen omistaja saa päivittää

// PÄIVITÄ TUOTE (vaatii login, tukee myös uuden kuvan uploadia)
router.put("/products/:productId", auth, upload.single("image"), async (req, res) => {
  const id = req.params.productId;

  const product = await Product.findById(id);
  if (!product) return res.sendStatus(404);

  if (String(product.ownerId) !== String(req.userId)) {
    return res.sendStatus(403);
  }
  // Tekstikentät tulee req.body:sta
  if (req.body.name != null) product.name = String(req.body.name).trim();
  if (req.body.description != null) product.description = String(req.body.description).trim();

  // Jos lähetettiin uusi kuva, päivitä imagePath
  if (req.file) {
    product.imagePath = `/uploads/${req.file.filename}`;
  }

  await product.save();
  res.json(product);
});

// ------------------------------------------------------------
// POISTA TUOTE (vaatii login)
// Vain tuotteen omistaja saa poistaa.
// ------------------------------------------------------------
// POISTA TUOTE (vaatii login)
router.delete("/products/:productId", auth, async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.sendStatus(404);

  if (String(product.ownerId) !== String(req.userId)) {
    return res.sendStatus(403); // kirjautunut, mutta ei oikeutta
  }

  await Review.deleteMany({ productId: req.params.productId });
  await product.deleteOne();
  return res.sendStatus(204);
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
    const reviewId = req.params.reviewId;
    const productId = req.params.productId;
    const userId = req.userId;

    const review = await Review.findById(reviewId);
    if (!review) return res.sendStatus(404);

    if (String(review.productId) !== productId) return res.sendStatus(404);
    if (String(review.userId) !== userId) return res.sendStatus(403);

    review.arvosteluNumero = req.body.arvosteluNumero ?? review.arvosteluNumero;
    review.arvosteluTeksti = req.body.arvosteluTeksti ?? review.arvosteluTeksti;
    review.nimimerkki = req.body.nimimerkki ?? review.nimimerkki;

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
