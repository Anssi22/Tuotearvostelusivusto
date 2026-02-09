<!-- src/components/ProductList.vue -->
<template>
  <section>
    <!-- Otsikko + päivitysnappi -->
    <div class="topRow">
      <h2>Tuotteet</h2>
      <button @click="$emit('refresh')" :disabled="loading">
        {{ loading ? "Ladataan..." : "Päivitä" }}
      </button>
    </div>

    <!-- Tilat -->
    <p v-if="loading" class="muted">Ladataan…</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="!products?.length" class="muted">Ei tuotteita.</p>

    <!-- Tuotekortit -->
    <div v-else class="grid">
      <article v-for="p in products" :key="p._id" class="card">
        <div class="cardHeader">
          <div>
            <h3 class="title">{{ p.name }}</h3>
            <p class="muted desc">{{ p.description }}</p>
          </div>
        </div>

        <div class="reviews">
          <h4>Arvostelut</h4>

          <p v-if="!p.reviews || p.reviews.length === 0" class="muted">
            Ei arvosteluja vielä.
          </p>

          <!--
            ReviewItem:
            - saa review-olion propsina
            - saa isOwner booleanin, jotta se voi näyttää edit/delete napit
            - emittoi update(reviewId, payload) ja delete(reviewId)
          -->
          <ReviewItem
            v-for="r in (p.reviews || [])"
            :key="r._id"
            :review="r"
            :isOwner="isOwner(r)"
            @update="(reviewId, payload) => $emit('updateReview', p._id, reviewId, payload)"
            @delete="(reviewId) => $emit('deleteReview', p._id, reviewId)"
          />

          <!--
            ProductReviewForm:
            - tarvitsee productId:n (required prop)
            - emittoi submit(payload), jonka ProductList välittää parentille addReview(productId, payload)
          -->
        <ProductReviewForm
          :productId="p._id"
          :currentUserName="currentUserEmail"
          :disabled="loading"
          @submit="(payload) => $emit('addReview', p._id, payload)"
        />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import ProductReviewForm from "./ProductReviewForm.vue";
import ReviewItem from "./ReviewItem.vue";

const props = defineProps({
  products: { type: Array, default: () => [] },

  // TÄRKEÄ: tällä hetkellä omistajuus tarkistetaan emaililla.
  // Jos backend palauttaa vain userId:n, tämä logiikka ei osu.
  currentUserEmail: { type: String, required: true },

  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

// Omistajuustarkistus (HUOM: toimii vain jos review sisältää userEmail/user)
function isOwner(review) {
  const ownerEmail = (review?.userEmail || review?.user || "").trim().toLowerCase();
  return ownerEmail === props.currentUserEmail.trim().toLowerCase();
}
</script>

<style scoped>
.topRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 12px; }
.card { border: 1px solid #eee; border-radius: 16px; padding: 14px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
.cardHeader { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.title { margin: 0 0 4px; }
.desc { margin: 0; }
.reviews { margin-top: 10px; }
.error { color: #b00020; }
.muted { color: #666; }
</style>
