<!-- src/components/ReviewItem.vue -->
<template>
  <div class="review">
    <div class="row">
      <div>
        <strong>{{ review.user }}</strong>
        <span class="muted"> • {{ review.rating }}/5</span>
      </div>

      <div v-if="isOwner" class="actions">
        <button v-if="!editing" @click="startEdit">Muokkaa</button>
        <button v-if="editing" @click="cancel">Peru</button>
        <button v-if="editing" class="primary" @click="save">Tallenna</button>
        <button class="danger" @click="$emit('delete', review._id)">Poista</button>
      </div>
    </div>

    <p v-if="!editing" class="text">{{ review.text }}</p>

    <div v-else class="editBox">
      <label class="muted">Arvosana</label>
      <input v-model.number="editRating" type="number" min="1" max="5" />

      <label class="muted">Kommentti</label>
      <textarea v-model.trim="editText" rows="3"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  review: { type: Object, required: true },
  productId: { type: String, required: true },
  isOwner: { type: Boolean, default: false },
});

const emit = defineEmits(["update", "delete"]);

const editing = ref(false);
const editRating = ref(props.review.rating);
const editText = ref(props.review.text);

function startEdit() {
  editing.value = true;
  editRating.value = props.review.rating;
  editText.value = props.review.text;
}

function cancel() {
  editing.value = false;
}

function save() {
  emit("update", props.review._id, {
    rating: editRating.value,
    text: editText.value,
  });
  editing.value = false;
}
</script>

<style scoped>
.review { border: 1px solid #f0f0f0; border-radius: 12px; padding: 10px; margin: 10px 0; }
.row { display: flex; justify-content: space-between; gap: 10px; align-items: center; }
.text { margin: 8px 0 0; }
.muted { color: #666; font-size: 13px; }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
button { padding: 6px 10px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; font-size: 13px; }
.primary { border-color: #bbb; font-weight: 600; }
.danger { border-color: #f0b; }
.editBox { margin-top: 8px; display: grid; gap: 6px; }
input, textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
</style>
