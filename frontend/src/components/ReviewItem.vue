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

      <!-- Omistaja näkee muokkaa/poista -->
      <div v-if="isOwner" class="actions">
        <button type="button" class="secondary" @click="startEdit" :disabled="disabled">
          Muokkaa
        </button>
        <button type="button" class="danger" @click="askDelete" :disabled="disabled">
          Poista
        </button>
      </div>
    </div>

    <!-- Muokkaustila -->
    <form v-else class="edit" @submit.prevent="save">
      <label>
        Arvosana (1–5)
        <input
          v-model.number="draftNumero"
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
          v-model.trim="draftTeksti"
          rows="3"
          required
          :disabled="disabled"
        ></textarea>
      </label>

      <div class="actions">
        <button type="submit" :disabled="disabled || !canSave">Tallenna</button>
        <button type="button" class="secondary" @click="cancel" :disabled="disabled">Peru</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

/**
 * Props:
 * - review: yhden arvostelun data
 * - isOwner: parent laskee (review.userId === currentUserId)
 * - disabled: parent disabloi esim. loading-tilassa
 */
const props = defineProps({
  review: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

/**
 * Emits:
 * - update(reviewId, payload)
 * - delete(reviewId)
 */
const emit = defineEmits(["update", "delete"]);

const editing = ref(false);

// Draftit (muokkaus ei saa muuttaa propseja suoraan)
const draftNumero = ref(props.review?.arvosteluNumero ?? 5);
const draftTeksti = ref(props.review?.arvosteluTeksti ?? "");

// Jos parent refetchaa reviewt, synkkaa draftit kun ei olla edit-tilassa
watch(
  () => props.review,
  (r) => {
    if (!editing.value) {
      draftNumero.value = r?.arvosteluNumero ?? 5;
      draftTeksti.value = r?.arvosteluTeksti ?? "";
    }
  },
  { deep: true }
);

const canSave = computed(() => {
  const r = Number(draftNumero.value);
  const t = (draftTeksti.value || "").trim();
  return r >= 1 && r <= 5 && t.length > 0;
});

function startEdit() {
  draftNumero.value = props.review.arvosteluNumero ?? 5;
  draftTeksti.value = props.review.arvosteluTeksti ?? "";
  editing.value = true;
}

function cancel() {
  editing.value = false;
}

function save() {
  if (!canSave.value) return;

  // Lähetä payload backendin kenttänimillä
  emit("update", props.review._id, {
    arvosteluNumero: Number(draftNumero.value),
    arvosteluTeksti: draftTeksti.value.trim(),
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

.actions { display: flex; gap: 8px; margin-top: 8px; }
label { display: grid; gap: 6px; font-size: 14px; margin-top: 8px; }

input, textarea {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font: inherit;
  background: white;
}

button {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
}
button:disabled { opacity: .6; cursor: default; }
button.secondary { background: #fafafa; }
button.danger { border-color: #f2b8b5; background: #fff5f5; }
</style>
