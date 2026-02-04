<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>Tuotearvostelusivusto</h1>
        <p class="muted">Vue + Node + MongoDB + JWT</p>
      </div>

      <div v-if="user" class="userBox">
        <div class="muted">Kirjautunut:</div>
        <div class="userRow">
          <strong>{{ user.email }}</strong>
          <button @click="logout">Kirjaudu ulos</button>
        </div>
      </div>
    </header>

    <main class="content">
      <AuthForm v-if="!user" @authed="onAuthed" />

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
import { onMounted, ref } from "vue";
import ProductList from "./components/ProductList.vue";
import AuthForm from "./components/AuthForm.vue";
import { api, setToken, getToken } from "./api";

const user = ref(null);
const products = ref([]);
const loading = ref(false);
const error = ref("");

async function bootstrapAuth() {
  const token = getToken();
  if (!token) return;
  try {
    user.value = await api.me();
  } catch {
    // token vanhentunut tms.
    setToken("");
    user.value = null;
  }
}

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

function onAuthed(me) {
  user.value = me;
  loadProducts();
}

function logout() {
  setToken("");
  user.value = null;
  products.value = [];
}

onMounted(async () => {
  await bootstrapAuth();
  if (user.value) await loadProducts();
});

async function handleAddReview(productId, payload) {
  try {
    await api.addReview(productId, payload);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun lisäys epäonnistui");
  }
}

async function handleUpdateReview(productId, reviewId, payload) {
  try {
    await api.updateReview(productId, reviewId, payload);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun muokkaus epäonnistui");
  }
}

async function handleDeleteReview(productId, reviewId) {
  if (!confirm("Poistetaanko arvostelu?")) return;
  try {
    await api.deleteReview(productId, reviewId);
    await loadProducts();
  } catch (e) {
    alert(e?.message || "Arvostelun poisto epäonnistui");
  }
}
</script>

<style scoped>
.page { max-width: 1000px; margin: 0 auto; padding: 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; }
.header { display: flex; gap: 16px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
.content { margin-top: 16px; }
.muted { color: #666; }
.userBox { display: flex; flex-direction: column; gap: 6px; }
.userRow { display: flex; gap: 12px; align-items: center; }
button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
</style>
