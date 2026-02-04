<!-- src/components/ProductReviewForm.vue -->
<template>
  <form class="form" @submit.prevent="submit">
    <h4>Lisää arvostelu</h4>

    <label>
      Nimimerkki
      <input v-model.trim="user" required />
    </label>

    <label>
      Arvosana (1–5)
      <input v-model.number="rating" type="number" min="1" max="5" required />
    </label>

    <label>
      Kommentti
      <textarea v-model.trim="text" rows="3" required></textarea>
    </label>

    <button type="submit">Tallenna</button>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  productId: { type: String, required: true },
  currentUser: { type: String, default: "guest" },
});

const emit = defineEmits(["submit"]);

const user = ref(props.currentUser);
const rating = ref(5);
const text = ref("");

watch(
  () => props.currentUser,
  (val) => (user.value = val || "guest")
);

function submit() {
  emit("submit", {
    user: user.value,
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
</style>
