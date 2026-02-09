# Tuotearvostelusovellus (Vue + Express + MongoDB)

Full-stack tuotearvostelusovellus, jossa voi:
- Rekisteröityä ja kirjautua (JWT-token)
- Listata tuotteet ja niiden arvostelut
- Lisätä tuotteita / muokata / poistaa (vain omistaja, kuvan upload + tallennus `uploads/` kansioon)
- Lisätä / muokata / poistaa arvosteluja (vain omistaja)

---


## Teknologiat

Frontend:
- Vue 3 (SFC, `<script setup>`)
- Vite

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT auth (custom middleware)
- Multer tiedostolatauksille (`multipart/form-data`)


---

# Asennus

## Esivaatimukset

-   Node.js (v18+ suositeltu) ja npm (Node Package Manager)
-   MongoDB (esim. MongoDB Atlas)
-   Git-versionhallinta

### 1. Node.js ja npm

### Mitä Node.js ja npm ovat?

- **Node.js** on ohjelmisto, jolla JavaScript‑koodia voidaan ajaa tietokoneella (backend‑palvelin).
- **npm** (Node Package Manager) on työkalu, jolla ladataan projektin tarvitsemat lisäkirjastot.

### Tarkista, ovatko ne asennettu?

Kirjoita komentoriville eli esimerksi CMD:hen / komentokehotteeseen:

```
node --version
npm --version
```

Jos molemmat palauttavat versionumeron, voit jatkaa.

### Jos niitä ei ole, ne täytyy asentaa:

1. Mene osoitteeseen https://nodejs.org
2. Lataa **LTS (Long Term Support)** ‑versio
3. Asenna oletusasetuksilla
4. Sulje ja avaa komentokehote uudelleen

### 2. MongoDB – mikä se on ja miksi sitä tarvitaan?

MongoDB on tietokanta, jota käytetään tiedon pysyvään tallentamiseen.
Tässä sovelluksessa MongoDB:hen tallennetaan:

- generoidut Vakioveikkaus-rivit
- valittu vakio (esim. Futisvakio, Lätkävakio)
- kierroksen tunnistetiedot
- luontiaika ja rivimäärä
- historia-näkymässä näkyvät aiemmat generoinnit

Ilman MongoDB:tä sovellus kyllä käynnistyisi, mutta generointihistoriaa ei voitaisi tallentaa.

### MongoDB Atlas (suositeltu aloittelijalle)

MongoDB Atlas on pilvipalvelu, jossa:

- tietokantaa ei tarvitse asentaa omalle koneelle
- saat ilmaisen testikäyttöön sopivan tietokannan
- yhteys toimii internetin yli

### MongoDB-yhteys (URI)

MongoDB antaa käyttöön yhteysosoitteen, jota kutsutaan nimellä MongoDB URI.
URI näyttää esimerkiksi tältä:
- mongodb+srv://kayttaja:salasana@cluster0.xxxxx.mongodb.net/tuotearvostelu

Tämä URI on henkilökohtainen, eikä sitä saa jakaa julkisesti!
URI tallennetaan ympäristömuuttujana .env-tiedostoon.

###  4. Git – lähdekoodin lataamista varten

Avaa komentokehote (Windows: **Command Prompt** tai **PowerShell**, Mac/Linux: **Terminal**) ja kirjoita:

```
git --version
```

Jos saat vastaukseksi versionumeron (esim. `git version 2.44.0`), Git on asennettu.

Jos Git ei ole asennettu:
- Lataa se osoitteesta https://git-scm.com
- Asenna oletusasetuksilla

---
## 💾 Asennus

### 1. Kloonaa repositorio (lataa projektin koodi koneellesi)

Ennen kuin sovellusta voi käyttää, projektin lähdekoodi täytyy kopioida omalle tietokoneelle Gitin avulla.

1. Avaa komentorivi esim. cmd (komentokehote).

2. Siirry kansioon, johon haluat projektin.

3. Kloonaa (lataa) GitHub‑repositorio kirjoittamalla komentoriville:

```
git clone https://github.com/Anssi22/Tuotearvostelusivusto
```

4. Siirry projektikansioon:

```
cd Tuotearvostelusivusto
```

### 2. Riippuvuuksien asennus

### Mitä ovat riippuvuudet?

Riippuvuudet ovat valmiita ohjelmakirjastoja, joita sovellus käyttää. Ilman niitä:

- backend ei käynnisty
- frontend ei avaudu selaimessa

Ne määritellään tiedostossa `package.json`, ja ne asennetaan automaattisesti npm:n avulla.

### Backend‑riippuvuudet

1. Siirry backend‑kansioon:

```
cd backend
```

2. Asenna riippuvuudet:

```
npm install
```

Komentorivi lataa nyt kaikki backendin tarvitsemat kirjastot.

### Frontend‑riippuvuudet

1. Siirry frontend‑kansioon:

```
cd ../frontend
```

2. Asenna riippuvuudet:

```
npm install
```

Komentorivi lataa nyt kaikki frontendin tarvitsemat kirjastot.

### 3. Ympäristömuuttujat – henkilökohtaiset asetukset

### Mitä ovat ympäristömuuttujat?

Ympäristömuuttujat ovat asetuksia, jotka:

- sisältävät käyttäjäkohtaisia tietoja
- eivät kuulu suoraan lähdekoodiin
- eivät saa päätyä GitHubiin tietoturvasyistä

### .env‑tiedoston luominen

1. Mene frontend-kansioon:

```
cd frontend
```

2. Luo uusi tiedosto nimeltä:

```
.env
```

3. Lisää tiedostoon seuraavat rivit:

```
VITE_API_BASE=http://localhost:5000/api
```
Vite tekee env-muuttujat fronttiin vain jos ne alkaa `VITE_` prefixillä

4. Mene backend-kansioon:

```
cd ..
cd backend
```

2. Luo uusi tiedosto nimeltä:

```
.env
```

3. Lisää tiedostoon seuraavat rivit:

```
MONGODB_URI=<KOPIOI_TÄHÄN_OMA_MONGODB_YHTEYTESI>
PORT=5000
JWT_SECRET=super_secret_dev_only
```

.env-tiedostossa siis määritellään, mitä porttia backend-käyttää ja missä url-osoitteessa tietokantasi sijaitsee sekä JWT:n allekirjoituksessa käytettävä salaisuus.
​
### MongoDB‑yhteys

- MongoDB URI on **oma henkilökohtainen tietokantayhteytesi**
- Sen voi luoda esimerkiksi MongoDB Atlas ‑palvelussa
- Tätä arvoa ei saa jakaa julkisesti

#### Mistä löydän MongoDB URI ‑osoitteen (Atlas-esimerkki)

1. Mene osoitteeseen https://www.mongodb.com/cloud/atlas ja kirjaudu sisään / luo ilmainen tili.
2. Luo **Free Cluster** (esim. `M0`‑tasoinen, riittää hyvin testikäyttöön).
3. Kun klusteri on luotu:
   - valitse ylävalikosta **Database**  
   - klikkaa omaa klusteria (esim. `Cluster0`)
   - klikkaa painiketta **Connect**
4. Valitse vaihtoehdoista **Connect your application**.
5. Atlas näyttää sinulle yhteysosoitteen (Connection string), joka näyttää esim. tältä:

  ```text
   mongodb+srv://KÄYTTÄJÄNIMI:SALASANA@cluster0.xxxxx.mongodb.net/todos
  ```

### JWT-token

- JWT eli JSON Web Token on allekirjoitettu token (header.payload.signature), jolla client todistaa API:lle kuka on ja mihin sillä on oikeus; payload on luettavissa, joten sinne ei laiteta salaisuuksia.
​
- JWT on vähän kuin “leima” tai kulkulupa, jonka saat kirjautumisen jälkeen mukaan taskuun, jotta sinun ei tarvitse joka ovella kirjautua uudestaan. Kun menet seuraavan kerran API:n (palvelimen) luo pyytämään jotain (“anna minun omat tietoni”), näytät tämän luvan, ja palvelin näkee siitä, kuka olet ja mitä saat tehdä.
​
- Se token on pitkä tekstinpätkä, jossa on kolme osaa pisteillä erotettuna: header, payload ja signature (muotoa header.payload.signature). Payload-osassa on väittämiä (esim. käyttäjän id ja voimassaoloaika), mutta se ei ole “salainen kirje” vaan enemmänkin “luettavissa oleva lappu”, joten sinne ei pidä laittaa salaisuuksia kuten salasanoja. Signature on se “vahaleima”, jonka palvelin tekee omalla salaisella avaimellaan: jos joku yrittää muokata lappua (payloadia), leima ei enää täsmää ja palvelin hylkää tokenin.
​
- Käytännössä: 1) kirjaudut sisään → 2) saat JWT:n → 3) lähetät sen jokaisen pyynnön mukana (yleensä Authorization: Bearer ...) → 4) palvelin tarkistaa allekirjoituksen ja voimassaolon → 5) päästää läpi tai estää. Jos token vanhenee tai se on väärä, pitää kirjautua uudestaan tai hakea uusi token.
​
### 4. Backendin käynnistäminen

Siirry backend‑kansioon ja käynnistä palvelin:

```
cd backend
npm run dev
```

Jos kaikki toimii oikein, näet konsolissa viestin, että palvelin kuuntelee porttia 5000.
Jätä tämä komentokehoteikkuna auki, ettei backend-palvelin sammu.

### 5. Frontendin käynnistäminen

Avaa uusi komentorivi‑ikkuna (backendin pitää jäädä käyntiin) ja suorita:

```
cd frontend
npm run dev
```

### 6. Sovelluksen avaaminen


Avaa selaimella http://localhost:5173 ja käytä sovellusta.

---

## API Endpoints

Base: http://localhost:5000/api

Auth:
- POST /auth/register { email, password }
- POST /auth/login { email, password } -> { token }
- GET /auth/me (Authorization: Bearer)

Products:
- GET /products
  - Palauttaa tuotteet ja liittää jokaiseen reviews-arrayn (server-side join)

- POST /products (auth + multipart)
  - FormData: name, description, image (file)

- PUT /products/:productId (auth + multipart)
  - FormData: name?, description?, image?

- DELETE /products/:productId (auth)

Reviews:
- POST /products/:productId/reviews (auth) JSON payload

- PUT /products/:productId/reviews/:reviewId (auth) JSON payload

- DELETE /products/:productId/reviews/:reviewId (auth)

Authorization / omistajuus:
- Arvostelun muokkaus/poisto: sallittu vain jos review.userId === req.userId

- Tuotteen muokkaus/poisto: suositus

- tallenna tuotteeseen ownerId

- tarkista product.ownerId === req.userId, muuten 403


---

## Jatkokehitysideoita

-   Admin-rooli: voi poistaa mitä vain
-   Jos tuotteita alkaa olla paljon, niin tuotteet jaetaan eri kategorioihin.
