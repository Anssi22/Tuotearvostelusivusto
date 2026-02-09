<!-- src/components/ProductList.vue -->
<template>
  <section>
    <div class="topRow">
      <h2>Tuotteet</h2>

      <button type="button" @click="emit('refresh')" :disabled="loading">
        {{ loading ? "Ladataan..." : "Päivitä" }}
      </button>
    </div>

    <p v-if="loading" class="muted">Ladataan…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!products.length" class="muted">Ei tuotteita.</p>

    <div v-else class="grid">
      <article v-for="p in products" :key="p._id" class="card">
        <header class="cardHeader">
          <div class="cardTitleArea">
            <h3 class="title">{{ p.name }}</h3>
            <p v-if="p.description" class="muted desc">{{ p.description }}</p>
          </div>

          <div class="cardActions">
            <button
              v-if="isProductOwner(p)"
              type="button"
              class="secondary"
              :disabled="loading"
              @click="openEdit(p)"
            >
              Muokkaa
            </button>

            <!-- Muut napit näkyy kaikille -->
            <button
              type="button"
              class="secondary"
              :disabled="loading"
              @click="toggleReviews(p._id)"
            >
              {{ isReviewsOpen(p._id)
                ? "Piilota arvostelut"
                : `Näytä arvostelut (${(p.reviews || []).length})`
              }}
            </button>
          </div>

        </header>

        <img
          v-if="p.imagePath"
          class="productImg"
          :src="imgSrc(p.imagePath)"
          alt=""
          loading="lazy"
        />

        <div v-if="isReviewsOpen(p._id)" class="reviews">
          <p v-if="!p.reviews || p.reviews.length === 0" class="muted">
            Ei arvosteluja vielä.
          </p>

          <ReviewItem
            v-for="r in (p.reviews || [])"
            :key="r._id"
            :review="r"
            :isOwner="isOwner(r)"
            :disabled="loading"
            @update="(reviewId, payload) => emit('updateReview', p._id, reviewId, payload)"
            @delete="(reviewId) => emit('deleteReview', p._id, reviewId)"
          />

          <div class="addReview">
            <button
              type="button"
              class="secondary"
              :disabled="loading"
              @click="toggleAddForm(p._id)"
            >
              {{ isAddFormOpen(p._id) ? "Peru" : "Lisää arvostelu" }}
            </button>

            <ProductReviewForm
              v-if="isAddFormOpen(p._id)"
              :productId="p._id"
              :currentUserName="currentUserEmail"
              :disabled="loading"
              @submit="(payload) => emit('addReview', p._id, payload)"
            />
          </div>
        </div>
      </article>
    </div>

    <!-- Edit modal -->
    <EditProductModal
      v-if="editingProduct"
      :product="editingProduct"
      :disabled="loading"
      @close="closeEdit"
      @save="(payload) => emitSave(payload)"
      @delete="() => emitDelete()"
    />
  </section>
</template>

<script setup>
import { ref } from "vue";
import EditProductModal from "./EditProductModal.vue";
import ProductReviewForm from "./ProductReviewForm.vue";
import ReviewItem from "./ReviewItem.vue";

const props = defineProps({
  products: { type: Array, default: () => [] },
  currentUserId: { type: String, required: true },
  currentUserEmail: { type: String, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

const emit = defineEmits([
  "refresh",
  "addReview",
  "updateReview",
  "deleteReview",
  // uudet:
  "updateProduct",
  "deleteProduct",
]);

// Reviews/add form togglet (sama kuin aiemmin)
const openReviews = ref({});
const openAddForm = ref({});

function isReviewsOpen(productId) {
  return !!openReviews.value[productId];
}
function isAddFormOpen(productId) {
  return !!openAddForm.value[productId];
}
function toggleReviews(productId) {
  const next = !openReviews.value[productId];
  openReviews.value = { ...openReviews.value, [productId]: next };
  if (!next) openAddForm.value = { ...openAddForm.value, [productId]: false };
}
function toggleAddForm(productId) {
  if (!openReviews.value[productId]) {
    openReviews.value = { ...openReviews.value, [productId]: true };
  }
  openAddForm.value = { ...openAddForm.value, [productId]: !openAddForm.value[productId] };
}

function isOwner(review) {
  return String(review?.userId) === String(props.currentUserId);
}

function isProductOwner(product) {
  return String(product?.ownerId) === String(props.currentUserId);
}

// Image helper (dev)
function imgSrc(imagePath) {
  return `http://localhost:5000${imagePath}`;
}

/**
 * Edit-modal state:
 * editingProduct = tuote joka on auki modaalissa
 */
const editingProduct = ref(null);

function openEdit(product) {
  editingProduct.value = product;
}

function closeEdit() {
  editingProduct.value = null;
}

/**
 * Kun modaali emittoi save(payload):
 * -> lähetetään parentille event updateProduct(productId, payload)
 * Parent tekee api.updateProduct(...) ja sen jälkeen refresh.
 */
function emitSave(payload) {
  const productId = editingProduct.value?._id;
  if (!productId) return;

  emit("updateProduct", productId, payload);
  closeEdit();
}

/**
 * Kun modaali emittoi delete:
 * -> lähetetään parentille event deleteProduct(productId)
 */
function emitDelete() {
  const productId = editingProduct.value?._id;
  if (!productId) return;

  emit("deleteProduct", productId);
  closeEdit();
}
</script>

<style scoped>
.topRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.card { border: 1px solid #e9e9ee; border-radius: 16px; padding: 14px; background: #fff; }
.cardHeader { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.cardTitleArea { min-width: 0; }
.cardActions { display: flex; gap: 8px; flex-wrap: wrap; }

.title { margin: 0 0 4px; }
.desc { margin: 0; }

.productImg {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid #f0f0f4;
}

.reviews { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f4; }
.addReview { margin-top: 10px; display: grid; gap: 10px; }

button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
button.secondary { background: #fafafa; }

.muted { color: #666; }
.error { color: #b00020; }
</style>
