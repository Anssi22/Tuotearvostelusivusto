<!-- src/components/ProductReviewForm.vue -->
<template>
  <!-- @submit.prevent estää sivun reloadin ja kutsuu submit()-funktiota -->
  <form class="form" @submit.prevent="submit">
    <h4>Lisää arvostelu</h4>

    <!-- Nimimerkki (tallennetaan review.nimimerkki kenttään) -->
    <label>
      Nimimerkki
      <input v-model.trim="nimimerkki" required :disabled="disabled" />
    </label>

    <label>
      Arvosana (1–5)
      <input
        v-model.number="arvosteluNumero"
        type="number"
        min="1"
        max="5"
        required
        :disabled="disabled"
      />
    </label>

    <label>
      Kommentti
      <textarea
        v-model.trim="arvosteluTeksti"
        rows="3"
        required
        :disabled="disabled"
      ></textarea>
    </label>

    <button type="submit" :disabled="disabled">
      Tallenna
    </button>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";

// Props: productId on pakollinen (ProductList antaa sen), currentUserName on valinnainen
// defineProps(...) määrittelee komponentin “sisääntulot”. Parent (tässä ProductList.vue) käyttää komponenttia näin:
// <ProductReviewForm :productId="p._id" :disabled="loading" ... />
const props = defineProps({
  productId: { type: String, required: true },
  currentUserName: { type: String, default: "guest" },

  // disabled on kätevä, koska ProductList voi disabloida lomakkeen loading-tilassa
  disabled: { type: Boolean, default: false },
});

// Tämä komponentti emittoi vain "submit" ja antaa payloadin parentille
const emit = defineEmits(["submit"]);

// Form state
const nimimerkki = ref(props.currentUserName);
const arvosteluNumero = ref(5);
const arvosteluTeksti = ref("");

// Jos parent vaihtaa currentUserName, päivitetään nimimerkki kenttään
watch(
  () => props.currentUserName,
  (val) => (nimimerkki.value = val || "guest")
);

function submit() {
  // Emittoidaan payload backendin kenttänimillä:
  // Review-skeemassa on authorName, rating, text
  emit("submit", {
    nimimerkki: nimimerkki.value,
    arvosteluNumero: arvosteluNumero.value,
    arvosteluTeksti: arvosteluTeksti.value,
  });

  // Tyhjennetään vain "sisältö", jätetään nimimerkki ennalleen
  arvosteluNumero.value = 5;
  arvosteluTeksti.value = "";
}
</script>

<style scoped>
.form {
  border-top: 1px solid #eee;
  margin-top: 12px;
  padding-top: 12px;
  display: grid;
  gap: 10px;
}
label { display: grid; gap: 6px; font-size: 14px; }
input, textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
button { justify-self: start; padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
</style>
