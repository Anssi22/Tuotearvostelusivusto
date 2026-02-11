<!-- src/components/ProductReviewForm.vue -->
<template>
  <!--
    @submit.prevent:
    - estää selaimen normaalin form submitin (ei reloadia)
    - kutsuu submit()-funktiota
  -->
  <form class="form" @submit.prevent="submit">
    <h4>Lisää arvostelu</h4>

    <label>
      Nimimerkki
      <input
        v-model.trim="nimimerkki"
        :disabled="disabled"
        autocomplete="nickname"
      />
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
        placeholder="Kirjoita arvostelu..."
      ></textarea>
    </label>

    <div class="actions">
      <button type="submit" :disabled="disabled || !canSubmit">Tallenna</button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from "vue";

/**
 * Props:
 * - productId: pakollinen (parent tietää mihin tuotteeseen review tulee)
 * - currentUserName: esitäyttö nimimerkille
 * - disabled: parent voi disabloida kun ladataan
 */
const props = defineProps({
  productId: { type: String, required: true },
  currentUserName: { type: String, default: "guest" },
  disabled: { type: Boolean, default: false },
});

/**
 * Emits:
 * - submit(payload)
 * Parent kuuntelee: @submit="(payload) => ..."
 */
const emit = defineEmits(["submit"]);

const nimimerkki = ref(props.currentUserName);
const arvosteluNumero = ref(5);
const arvosteluTeksti = ref("");

// Jos parent vaihtaa currentUserName, päivitä nimimerkki (esim. login/logout)
watch(
  () => props.currentUserName,
  (val) => {
    // Päivitä vain jos kenttä on tyhjä tai aiemmin guest,
    // ettei käyttäjän itse kirjoittama nimimerkki yliajaudu kesken.
    if (!nimimerkki.value || nimimerkki.value === "guest") {
      nimimerkki.value = val || "guest";
    }
  }
);

// Kevyt validointi nappiin: estä tyhjät arvot, paitsi nimimerkki
const canSubmit = computed(() => {
  const t = (arvosteluTeksti.value || "").trim();
  const r = Number(arvosteluNumero.value);
  return t.length > 0 && r >= 1 && r <= 5;
});

function submit() {
  if (!canSubmit.value) return;

  emit("submit", {
    nimimerkki: (nimimerkki.value || "").trim() || "Anonyymi",
    arvosteluNumero: Number(arvosteluNumero.value),
    arvosteluTeksti: arvosteluTeksti.value.trim(),
  });

  // Resetoi sisältö, jätä nimimerkki valmiiksi seuraavaa varten
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
input, textarea {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font: inherit;
  background: white;
}
.actions { display: flex; gap: 10px; }
button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: white;
  cursor: pointer;
}
button:disabled { opacity: .6; cursor: default; }
</style>
