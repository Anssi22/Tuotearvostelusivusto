# Todo-sovellus - React, Node.js & MongoDB

Käyttäjä voi lisätä, poistaa, muokata ja merkitä tehtäviä tehdyiksi/kesken.
Frontend on toteutettu Reactilla, backend Node.js/Expressillä ja tietokantana MongoDB.

---

## Ominaisuudet

-   Tehtävien lisääminen
-   Tehtävien poisto ja muokkaus
-   Tehtävien tilan vaihto
-   MongoDB-tallennus
-   HTTP-rajapinta frontendille

## Teknologiat

- Frontend: React, JavaScript\
- Backend: Node.js, Express, Mongoose\
- Tietokanta: MongoDB

---

# Asennus

## Esivaatimukset

-   Node.js (v18+ suositeltu) ja npm (Node Package Manager)
-   MongoDB (esim. MongoDB Atlas)

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
- mongodb+srv://kayttaja:salasana@cluster0.xxxxx.mongodb.net/vakioveikkaus

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
git clone https://github.com/Anssi22/toDo-sovellus.git
```

4. Siirry projektikansioon:

```
cd toDo-sovellus
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

1. Mene kansioon:

```
backend
```

2. Luo uusi tiedosto nimeltä:

```
.env
```

3. Lisää tiedostoon seuraavat rivit:

```
MONGODB_URI=<KOPIOI_TÄHÄN_OMA_MONGODB_YHTEYTESI>
PORT=5000
```

.env-tiedostossa siis määritellään, mitä porttia backend-käyttää ja missä url-osoitteessa tietokantasi sijaitsee.

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

## API-dokumentaatio

GET /api/todos\
POST /api/todos\
PUT /api/todos/:id\
DELETE /api/todos/:id

---

## Jatkokehitysideoita

-   Kuvien lisäys -ominaisuus
