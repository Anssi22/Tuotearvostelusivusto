<!-- src/components/EditProductModal.vue -->
<template>
  <!-- Teleport: modaali bodyyn, ei listan sisään -->
  <Teleport to="body">
    <!-- Overlay (taustapimennys): klikkaus sulkee -->
    <div class="overlay" @click="close">
      <!-- Dialog-kortti: click.stop ettei overlay click sulje kun klikkaat sisällä -->
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="`Muokkaa tuotetta: ${product?.name || ''}`"
        @click.stop
      >
        <header class="header">
          <h3 class="title">Muokkaa tuotetta</h3>

          <button type="button" class="secondary" @click="close" :disabled="disabled">
            Sulje
          </button>
        </header>

        <form class="form" @submit.prevent="submit">
          <label>
            Nimi *
            <input v-model.trim="name" required :disabled="disabled" />
          </label>

          <label>
            Kuvaus
            <textarea v-model.trim="description" rows="3" :disabled="disabled" />
          </label>

          <label>
            Vaihda kuva (valinnainen)
            <input
              ref="fileInputEl"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              @change="onFile"
              :disabled="disabled"
            />
          </label>

          <!-- Näytä nykyinen kuva jos löytyy -->
          <img
            v-if="product?.imagePath"
            class="img"
            :src="imgSrc(product.imagePath)"
            alt=""
            loading="lazy"
          />

          <!-- Näytä uuden kuvan preview jos valittiin -->
          <img v-if="previewUrl" class="img" :src="previewUrl" alt="Uusi esikatselu" />

          <p v-if="error" class="error">{{ error }}</p>

          <div class="actions">
            <button type="button" class="secondary" @click="close" :disabled="disabled">
              Peru
            </button>

            <button type="submit" class="primary" :disabled="disabled || !canSubmit">
              Tallenna
            </button>
          </div>

          <hr class="sep" />

          <div class="dangerZone">
            <p class="muted">
              Poisto poistaa tuotteen (ja jos backendissä teit niin, myös arvostelut).
            </p>

            <button type="button" class="danger" @click="askDelete" :disabled="disabled">
              Poista tuote
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  // product = se tuote jota muokataan
  product: { type: Object, required: true },
  // esim. kun API-kutsu on käynnissä
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "save", "delete"]);

const name = ref("");
const description = ref("");

const imageFile = ref(null);
const previewUrl = ref("");
const error = ref("");

const fileInputEl = ref(null);

const canSubmit = computed(() => name.value.trim().length > 0);

function syncFromProduct() {
  name.value = props.product?.name || "";
  description.value = props.product?.description || "";
  imageFile.value = null;

  error.value = "";

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";

  if (fileInputEl.value) fileInputEl.value.value = "";
}

// Kun modaali avataan / product vaihtuu, alustetaan kentät
watch(
  () => props.product,
  () => syncFromProduct(),
  { immediate: true }
);

function onFile(e) {
  const f = e.target.files?.[0] || null;
  imageFile.value = f;

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = f ? URL.createObjectURL(f) : "";
}

function submit() {
  error.value = "";
  if (!canSubmit.value) return;

  // Lähetetään vain se mitä tarvitaan: name/description aina, imageFile jos valittiin
  emit("save", {
    name: name.value.trim(),
    description: description.value.trim(),
    imageFile: imageFile.value, // File | null
  });
}

function askDelete() {
  error.value = "";
  if (confirm(`Poistetaanko tuote "${props.product?.name}"?`)) {
    emit("delete");
  }
}

function close() {
  emit("close");
}

// ESC sulkee modaalin (simple pattern: keydown listener) [web:752]
function onKeyDown(e) {
  if (e.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

// dev: sama hardcode kuin listassa
function imgSrc(imagePath) {
  return `http://localhost:5000${imagePath}`;
}
</script>

<style scoped>
/* Overlay peittää koko ruudun */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.40);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 9999;
}

/* Dialog “kortti” */
.dialog {
  width: min(720px, 100%);
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(17, 24, 39, 0.18);
  padding: 14px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.title {
  margin: 0;
}

.form {
  display: grid;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 14px;
}

input, textarea {
  padding: 8px 10px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  border-radius: 10px;
  font: inherit;
  background: white;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  border-radius: 10px;
  background: white;
  cursor: pointer;
}

button.secondary { background: #fafafa; }
button.primary { border-color: rgba(37, 99, 235, 0.30); color: #1d4ed8; }
button.danger { border-color: rgba(220, 38, 38, 0.30); color: #b91c1c; background: rgba(220, 38, 38, 0.06); }
button:disabled { opacity: 0.6; cursor: default; }

.img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #f0f0f4;
}

.sep {
  border: none;
  border-top: 1px solid #f0f0f4;
  margin: 10px 0;
}

.dangerZone {
  display: grid;
  gap: 8px;
}

.muted { color: #666; margin: 0; }
.error { color: #b00020; margin: 0; }
</style>
