<template>
  <form class="form" @submit.prevent="submit">
    <h4>Lisää arvostelu</h4>

    <label>
      Arvosana (1–5)
      <input
        v-model.number="rating"
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
        v-model.trim="text"
        rows="3"
        required
        :disabled="disabled"
        placeholder="Kirjoita arvostelu..."
      ></textarea>
    </label>

    <button type="submit" :disabled="disabled">
      Tallenna
    </button>
  </form>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["submit"]);

const rating = ref(5);
const text = ref("");

function submit() {
  emit("submit", {
    rating: rating.value,
    text: text.value,
  });

  rating.value = 5;
  text.value = "";
}
</script>

<style scoped>
.form { border-top: 1px solid #eee; margin-top: 12px; padding-top: 12px; display: grid; gap: 10px; }
label { display: grid; gap: 6px; font-size: 14px; }
input, textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
button { justify-self: start; padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
</style>
