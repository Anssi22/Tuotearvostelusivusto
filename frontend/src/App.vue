<!-- src/App.vue (siistitty) -->
<template>
  <div class="page">
    <header class="header">
      <div>
        <h1>Tuotearvostelusivusto</h1>
        <p class="muted">Selaa tuotteita ja kirjoita arvosteluja (Vue + fetch + REST).</p>
      </div>

      <div class="userBox">
        <label class="muted">Nimimerkki (”oma arvostelu”):</label>
        <input v-model.trim="currentUser" placeholder="esim Antti"/>
      </div>
    </header>

    <main class="content">
      <ProductList
        :products="products"
        :currentUser="currentUser"
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
import { onMounted, ref, watch } from "vue";
import ProductList from "./components/ProductList.vue";
import { api } from "./api";

const products = ref([]);
const loading = ref(false);
const error = ref("");
const currentUser = ref(localStorage.getItem("pr_user") || "guest");

watch(currentUser, (val) => localStorage.setItem("pr_user", val || "guest"));

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

onMounted(loadProducts);

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
input { padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; }
</style>
