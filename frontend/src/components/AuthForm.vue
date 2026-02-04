<template>
  <div class="card">
    <h2>{{ modeTitle }}</h2>
    <p class="muted">
      {{ mode === "login" ? "Kirjaudu sisään sähköpostilla." : "Luo uusi käyttäjä." }}
    </p>

    <form class="form" @submit.prevent="submit">
      <label>
        Email
        <input v-model.trim="email" type="email" required autocomplete="email" />
      </label>

      <label>
        Salasana
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? "Odota..." : modeTitle }}
      </button>

      <button type="button" class="link" @click="toggleMode" :disabled="loading">
        {{ mode === "login" ? "Ei tiliä? Rekisteröidy" : "On jo tili? Kirjaudu" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { api, setToken } from "../api";

const emit = defineEmits(["authed"]);

const mode = ref("login"); // "login" | "register"
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const modeTitle = computed(() => (mode.value === "login" ? "Kirjaudu" : "Rekisteröidy"));

function toggleMode() {
  error.value = "";
  mode.value = mode.value === "login" ? "register" : "login";
}

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    const res = mode.value === "login"
      ? await api.login(email.value, password.value)
      : await api.register(email.value, password.value);

    setToken(res.token);

    // hae /me jotta saadaan user varmasti tokenista
    const me = await api.me();
    emit("authed", me);
  } catch (e) {
    error.value = e?.message || "Auth epäonnistui";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.card { max-width: 420px; margin: 40px auto; border: 1px solid #eee; border-radius: 16px; padding: 18px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); }
.form { display: grid; gap: 12px; margin-top: 12px; }
label { display: grid; gap: 6px; }
input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
button { padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
.link { border: none; text-decoration: underline; padding: 6px 0; }
.muted { color: #666; }
.error { color: #b00020; margin: 0; }
</style>
