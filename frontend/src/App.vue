<!-- src/App.vue -->

<template>

  <!-- Päälayout -->
  <div class="page">
    <header class="header">
      <div>
        <h1>Tuotearvostelusivusto</h1>
      </div>

      <!-- Jos user löytyy -> näytä "kirjautunut" boksi + logout -->
      <div v-if="user" class="userBox">
        <div class="muted">Kirjautunut:</div>
        <div class="userRow">
          <!-- Vue interpoloi muuttujan templateen {{ ... }} -->
          <strong>{{ user.email }}</strong>
          <button @click="logout">Kirjaudu ulos</button>
        </div>
      </div>
    </header>

    <main class="content">
      <!-- Jos user puuttuu -> näytä AuthForm -->
      <AuthForm v-if="!user" @authed="onAuthed" />

      <!-- Muuten -> näytä ProductList ja välitä data propsina -->
      <ProductList
        v-else
        :products="products"
        :currentUserEmail="user.email"
        :loading="loading"
        :error="error"
        @refresh="loadProducts"
        @addReview="handleAddReview"
        @updateReview="handleUpdateReview"
        @deleteReview="handleDeleteReview"
      />
    </main>
  </div>
</template>

<script setup>
// script setup = Vue 3 Composition API -syntaksia, jossa tämä tiedosto on suoraan
// komponentin "setup"-funktio.

import { onMounted, ref } from "vue";

// Tuodaan lapsikomponentit
import ProductList from "./components/ProductList.vue";
import AuthForm from "./components/AuthForm.vue";

// Tuodaan backend-API wrapper + tokenin asetus/luku
import { api, setToken, getToken } from "./api";

// ref(...) tekee reaktiivisen muuttujan.
// Kun muutat .value (tai template käyttää sitä), UI päivittyy automaattisesti.
const user = ref(null);       // kirjautunut käyttäjä (tai null)
const products = ref([]);     // tuotteet listaan
const loading = ref(false);   // lataustila
const error = ref("");        // virheteksti

// Kun sovellus käynnistyy, yritetään "palauttaa sessio":
// jos localStoragessa on token, kutsutaan /auth/me ja haetaan käyttäjän tiedot.
async function bootstrapAuth() {
  const token = getToken();
  if (!token) return;

  try {
    user.value = await api.me(); // GET /api/auth/me (Bearer-token mukana)
  } catch {
    // Jos token on vanhentunut/invalid -> poistetaan token ja nollataan user
    setToken("");
    user.value = null;
  }
}

// Hakee tuotteet backendistä ja päivittää products-tilan.
async function loadProducts() {
  loading.value = true;
  error.value = "";

  try {
    const data = await api.getProducts(); // GET /api/products

    // Jos backend palauttaa suoraan arrayn -> käytä sitä
    // Jos backend palauttaa { products: [...] } -> käytä data.products
    products.value = Array.isArray(data) ? data : (data.products || []);
  } catch (e) {
    error.value = e?.message || "Tuotteiden haku epäonnistui";
  } finally {
    loading.value = false;
  }
}

// Kun AuthForm onnistuu (register/login), se emittoi "authed" ja antaa
// mukana käyttäjä-objektin (me). App ottaa sen vastaan tässä.
function onAuthed(me) {
  user.value = me;
  loadProducts();
}

// Logout = poista token, nollaa user ja tyhjennä tuotteet
function logout() {
  setToken("");
  user.value = null;
  products.value = [];
}

// onMounted ajetaan kun App komponentti on ladattu sivulle.
// Ensin yritetään palauttaa kirjautuminen, ja jos user löytyy, haetaan tuotteet.
onMounted(async () => {
  await bootstrapAuth();
  if (user.value) await loadProducts();
});

// Nämä handlerit välitetään ProductListille eventteihin.
// ProductList emittoi addReview/updateReview/deleteReview, App kutsuu APIa.
async function handleAddReview(productId, payload) {
  try {
    await api.addReview(productId, payload); // POST /api/products/:id/reviews
    await loadProducts();                   // päivitetään lista
  } catch (e) {
    alert(e?.message || "Arvostelun lisäys epäonnistui");
  }
}

async function handleUpdateReview(productId, reviewId, payload) {
  try {
    await api.updateReview(productId, reviewId, payload); // PUT /api/products/:pid/reviews/:rid
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun muokkaus epäonnistui");
  }
}

async function handleDeleteReview(productId, reviewId) {
  if (!confirm("Poistetaanko arvostelu?")) return;

  try {
    await api.deleteReview(productId, reviewId); // DELETE /api/products/:pid/reviews/:rid
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun poisto epäonnistui");
  }
}
</script>

<style scoped>
/* scoped = nämä tyylit koskevat vain tätä komponenttia */
.page { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
.header { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.content { margin-top: 16px; }
.muted { color: #666; }
.userBox { display: flex; flex-direction: column; gap: 6px; }
.userRow { display: flex; gap: 12px; align-items: center; }
button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
</style>
