<!-- src/components/ProductCreateForm.vue -->
<template>
  <section class="card">
    <div class="topRow">
      <h2>Lisää tuote</h2>

      <button
        type="button"
        class="secondary"
        @click="open = !open"
        :disabled="disabled"
      >
        {{ open ? "Sulje" : "Lisää" }}
      </button>
    </div>

    <!-- @submit.prevent = ei sivun reloadia -->
    <form v-if="open" class="form" @submit.prevent="submit">
      <label>
        Nimi *
        <input v-model.trim="name" required :disabled="disabled" autocomplete="off" />
      </label>

      <label>
        Kuvaus
        <textarea v-model.trim="description" rows="3" :disabled="disabled"></textarea>
      </label>

      <label>
        Kuva (png/jpg/webp)
        <input
          ref="fileInputEl"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          @change="onFile"
          :disabled="disabled"
        />
      </label>

      <!-- Pieni preview (valinnainen) -->
      <img v-if="previewUrl" class="preview" :src="previewUrl" alt="Esikatselu" />

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="submit" class="primary" :disabled="disabled || !canSubmit">
          Tallenna tuote
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";

// Props ok script setupissa defineProps-makrolla. [web:676]
const props = defineProps({
  disabled: { type: Boolean, default: false },
});

// Parent kuuntelee: @create="handler"
const emit = defineEmits(["create"]);

const open = ref(false);

const name = ref("");
const description = ref("");

const imageFile = ref(null);     // tänne File-objekti
const previewUrl = ref("");      // ObjectURL esikatselua varten

const error = ref("");
const fileInputEl = ref(null);

const canSubmit = computed(() => name.value.trim().length > 0);

function onFile(e) {
  const f = e.target.files?.[0] || null;
  imageFile.value = f;

  // Päivitä preview
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = f ? URL.createObjectURL(f) : "";

  // Jos haluat että saman tiedoston valinta triggeröi change aina:
  // e.target.value = null;
}

function resetForm() {
  name.value = "";
  description.value = "";
  imageFile.value = null;
  error.value = "";

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";

  // tyhjennä file input UI:sta
  if (fileInputEl.value) fileInputEl.value.value = "";
}

function submit() {
  error.value = "";
  if (!canSubmit.value) return;

  // Emit payload parentille: se kutsuu api.createProduct({ ... })
  emit("create", {
    name: name.value.trim(),
    description: description.value.trim(),
    imageFile: imageFile.value, // File | null
  });

  resetForm();
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<style scoped>
/* Voit halutessa poistaa tämän kokonaan jos käytät globaaleja tyylejä */
.card { border: 1px solid #e9e9ee; border-radius: 16px; padding: 14px; background: #fff; }
.topRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.form { display: grid; gap: 10px; margin-top: 12px; }
label { display: grid; gap: 6px; font-size: 14px; }
input, textarea { padding: 8px 10px; border: 1px solid #ddd; border-radius: 10px; font: inherit; background: white; }
.actions { display: flex; gap: 10px; }
button { padding: 8px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button.secondary { background: #fafafa; }
button.primary { border-color: rgba(37, 99, 235, 0.30); color: #1d4ed8; }
button:disabled { opacity: .6; cursor: default; }
.error { color: #b00020; margin: 0; }
.preview { width: 100%; max-width: 360px; border-radius: 12px; border: 1px solid #eee; }
</style>
