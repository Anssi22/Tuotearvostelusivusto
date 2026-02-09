<!-- src/App.vue -->
<template>
  <div class="page">
    <!-- HEADER -->
    <header class="header">
      <div class="brand">
        <h1 class="title">Tuotearvostelusivusto</h1>
        <p class="muted">Lisää tuotteita ja arvioi niitä kirjautuneena.</p>
      </div>

      <div class="right">
        <!-- Kun käyttäjä on kirjautunut -->
        <div v-if="user" class="userBox">
          <div class="muted small">Kirjautunut</div>
          <div class="userRow">
            <strong>{{ user.email }}</strong>
            <button type="button" class="secondary" @click="logout" :disabled="loading">
              Kirjaudu ulos
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="content">
      <!-- Jos ei ole useria, näytä login/register -->
      <AuthForm v-if="!user" @authed="onAuthed" />

      <!-- Jos on user, näytä sovellus -->
      <div v-else class="app">
        <!-- Tuotteen lisäys (vaatii kirjautumisen) -->
        <ProductCreateForm
          :disabled="loading"
          @create="handleCreateProduct"
        />

        <!-- Tuotelista + arvostelut -->
        <ProductList
          :products="products"
          :currentUserId="user._id"
          :currentUserEmail="user.email"
          :loading="loading"
          :error="error"
          @refresh="loadProducts"
          @updateProduct="onUpdateProduct"
          @deleteProduct="onDeleteProduct"
          @addReview="handleAddReview"
          @updateReview="handleUpdateReview"
          @deleteReview="handleDeleteReview"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

import AuthForm from "./components/AuthForm.vue";
import ProductList from "./components/ProductList.vue";
import ProductCreateForm from "./components/ProductCreateForm.vue";

import { api, getToken, setToken } from "./api";

const user = ref(null);
const products = ref([]);
const loading = ref(false);
const error = ref("");

/**
 * 1) Kun app käynnistyy:
 * - jos localStoragessa on token, yritä hakea /auth/me
 * - jos onnistuu, user asetetaan ja UI vaihtuu “kirjautuneeseen” tilaan
 */
async function bootstrapAuth() {
  const token = getToken();
  if (!token) return;

  try {
    user.value = await api.me();
  } catch {
    setToken("");
    user.value = null;
  }
}

/**
 * 2) Hae tuotteet + reviews backendistä
 */
async function loadProducts() {
  loading.value = true;
  error.value = "";

  try {
    const data = await api.getProducts();
    products.value = Array.isArray(data) ? data : (data.products || []);
  } catch (e) {
    error.value = e?.message || "Tuotteiden haku epäonnistui";
  } finally {
    loading.value = false;
  }
}

/**
 * AuthForm emittoi "authed" kun login/register onnistuu.
 * Me asetetaan user ja ladataan tuotteet.
 */
function onAuthed(me) {
  user.value = me;
  loadProducts();
}

function logout() {
  setToken("");
  user.value = null;
  products.value = [];
  error.value = "";
}

/**
 * Tuotteen luonti (vaatii backendissä POST /products authilla)
 */
async function handleCreateProduct(payload) {
  loading.value = true;
  try {
    await api.createProduct(payload);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Tuotteen lisäys epäonnistui");
  } finally {
    loading.value = false;
  }
}

/**
 * Reviews CRUD (ProductList emittoi eventit, App kutsuu APIa)
 */
async function handleAddReview(productId, payload) {
  loading.value = true;
  try {
    await api.addReview(productId, payload);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun lisäys epäonnistui");
  } finally {
    loading.value = false;
  }
}

async function handleUpdateReview(productId, reviewId, payload) {
  loading.value = true;
  try {
    await api.updateReview(productId, reviewId, payload);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun muokkaus epäonnistui");
  } finally {
    loading.value = false;
  }
}

async function handleDeleteReview(productId, reviewId) {
  if (!confirm("Poistetaanko arvostelu?")) return;

  loading.value = true;
  try {
    await api.deleteReview(productId, reviewId);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun poisto epäonnistui");
  } finally {
    loading.value = false;
  }
}

async function onUpdateProduct(productId, payload) {
  try {
    loading.value = true;
    await api.updateProduct({ productId, ...payload });
    await loadProducts();
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function onDeleteProduct(productId) {
  try {
    loading.value = true;
    await api.deleteProduct(productId);
    await loadProducts();
  } catch (e) {
    error.value = e.message || String(e);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await bootstrapAuth();
  if (user.value) await loadProducts();
});
</script>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
}
.header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
}
.brand .title { margin: 0; }
.content { margin-top: 16px; }
.app { display: grid; gap: 16px; }

.userBox { display: grid; gap: 6px; }
.userRow { display: flex; gap: 10px; align-items: center; }

button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
}
button.secondary { background: #fafafa; }
button:disabled { opacity: .6; cursor: default; }

.muted { color: #666; }
.small { font-size: 12px; }
</style>
