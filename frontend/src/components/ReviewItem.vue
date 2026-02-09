<!-- src/components/ReviewItem.vue -->
<template>
  <div class="item">
    <!-- Näyttötila -->
    <div v-if="!editing" class="view">
      <div class="row">
        <strong>{{ review.nimimerkki || "Anonyymi" }}</strong>
        <span class="muted">• {{ review.arvosteluNumero }}/5</span>
      </div>

      <p class="text">{{ review.arvosteluTeksti }}</p>

      <!-- Näytä edit/delete vain omistajalle -->
      <div v-if="isOwner" class="actions">
        <button type="button" @click="startEdit" :disabled="disabled">Muokkaa</button>
        <button type="button" @click="askDelete" :disabled="disabled">Poista</button>
      </div>
    </div>

    <!-- Muokkaustila -->
    <form v-else class="edit" @submit.prevent="save">
      <label>
        Arvosana (1-5)
        <input v-model.number="draftRating" type="number" min="1" max="5" required :disabled="disabled" />
      </label>

      <label>
        Kommentti
        <textarea v-model.trim="draftText" rows="3" required :disabled="disabled"></textarea>
      </label>

      <div class="actions">
        <button type="submit" :disabled="disabled">Tallenna</button>
        <button type="button" @click="cancel" :disabled="disabled">Peru</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// ReviewItem:n pitää saada review-objekti ja tieto onko omistaja
const props = defineProps({
  review: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

// Tämä komponentti emittoi:
// - update(reviewId, payload)
// - delete(reviewId)
const emit = defineEmits(["update", "delete"]);

const editing = ref(false);

// Draft-kentät muokkausta varten
const draftRating = ref(props.review?.arvosteluNumero ?? 5);
const draftText = ref(props.review?.arvosteluTeksti ?? "");


// Jos parent päivittää review-objektin (esim. refetch), päivitä draftit kun ei editoida
watch(
  () => props.review,
  (r) => {
    if (!editing.value) {
      draftRating.value = r?.arvosteluNumero ?? 5;
      draftText.value = r?.arvosteluTeksti ?? "";
    }
  },
  { deep: true }
);

function startEdit() {
  draftRating.value = props.review.arvosteluNumero;
  draftText.value = props.review.arvosteluTeksti;
  editing.value = true;
}

function cancel() {
  editing.value = false;
}

function save() {
  // Lähetetään parentille payload; parent (ProductList/App) kutsuu backendin
  emit("update", props.review._id, {
    arvosteluNumero: draftRating.value,
    arvosteluTeksti: draftText.value,
  });
  editing.value = false;
}

function askDelete() {
  emit("delete", props.review._id);
}
</script>

<style scoped>
.item { border-top: 1px dashed #eee; padding-top: 10px; margin-top: 10px; }
.row { display: flex; gap: 8px; align-items: baseline; }
.text { margin: 6px 0; }
.muted { color: #666; font-size: 13px; }
.actions { display: flex; gap: 8px; }
button { padding: 6px 10px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
label { display: grid; gap: 6px; font-size: 14px; margin-top: 8px; }
input, textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
</style>
