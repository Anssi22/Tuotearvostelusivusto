<!-- src/components/AuthForm.vue -->
<template>
  <!-- “Kortti” joka sisältää login/register -lomakkeen -->
  <div class="card">
    <!-- Otsikko muuttuu moden mukaan -->
    <h2>{{ modeTitle }}</h2>

    <!-- Pieni seliteteksti moden mukaan -->
    <p class="muted">
      {{ mode === "login" ? "Kirjaudu sisään sähköpostilla." : "Luo uusi käyttäjä." }}
    </p>

    <!--
      @submit.prevent:
      - estää selaimen normaalin formin submitin (ei sivun reloadia)
      - kutsuu meidän submit()-funktiota (SPA-tyyli)
    -->
    <form class="form" @submit.prevent="submit">
      <label>
        Email
        <!-- v-model.trim = kaksisuuntainen bind: input -> email ref, trimmaa välit -->
        <input v-model.trim="email" type="email" required autocomplete="email" />
      </label>

      <label>
        Salasana
        <!-- v-model = kaksisuuntainen bind: input -> password ref -->
        <!-- autocomplete voisi olla:
             - login: current-password
             - register: new-password
             mutta tämäkin toimii ok -->
        <input
          v-model="password"
          type="password"
          required
          :autocomplete="passwordAutocomplete"
        />
      </label>

      <!-- Näytetään virhe vain jos error-tekstiä on -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Submit-nappi; disabled kun loading -->
      <button type="submit" :disabled="loading">
        {{ loading ? "Odota..." : modeTitle }}
      </button>

      <!-- Toinen nappi vaihdolle login <-> register -->
      <button type="button" class="link" @click="toggleMode" :disabled="loading">
        {{ mode === "login" ? "Ei tiliä? Rekisteröidy" : "On jo tili? Kirjaudu" }}
      </button>
    </form>
  </div>
</template>

<script setup>
// Vue 3 Composition API, script setup -syntaksi
import { computed, ref } from "vue";

// api = HTTP wrapper (fetch + baseUrl + Bearer token automaattisesti)
// setToken = tallentaa JWT:n localStorageen
import { api, setToken } from "../api";

// defineEmits kertoo mitä eventtejä tämä komponentti voi lähettää parentille.
// Tässä: kun auth onnistuu, emit("authed", me) [web:382]
const emit = defineEmits(["authed"]);

// mode kertoo ollaanko kirjautumassa vai rekisteröitymässä
const mode = ref("login"); // "login" | "register"

// Lomakekenttien tilat (ref = reaktiivinen arvo)
const email = ref("");
const password = ref("");

// UI-tilat
const loading = ref(false);
const error = ref("");

// computed = johdettu arvo: päivittyy automaattisesti kun mode muuttuu
const modeTitle = computed(() =>
  mode.value === "login" ? "Kirjaudu" : "Rekisteröidy"
);

// Vaihda login <-> register ja nollaa virhe
function toggleMode() {
  error.value = "";
  mode.value = mode.value === "login" ? "register" : "login";

  // (Valinnainen) tyhjennä salasana vaihdossa:
  // password.value = "";
}

// Kun formi submitataan
async function submit() {
  loading.value = true;
  error.value = "";

  try {
    // 1) Kutsu oikeaa endpointia moden perusteella
    const res =
      mode.value === "login"
        ? await api.login(email.value, password.value)
        : await api.register(email.value, password.value);

    // 2) Tallenna token localStorageen, jotta seuraavat API-kutsut
    //    sisältää Authorization: Bearer <token>
    setToken(res.token);

    // 3) Hae /me, jotta saadaan varmasti käyttäjän tiedot tokenin perusteella
    const me = await api.me();

    // 4) Ilmoita parentille (App.vue): "nyt ollaan kirjautuneita"
    emit("authed", me);
  } catch (e) {
    // Näytä backendin virhe viestinä
    error.value = e?.message || "Auth epäonnistui";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* scoped = nämä tyylit koskee vain tätä komponenttia */
.card {
  max-width: 420px;
  margin: 40px auto;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.form { display: grid; gap: 12px; margin-top: 12px; }
label { display: grid; gap: 6px; }
input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; font: inherit; }
button { padding: 10px 12px; border: 1px solid #ddd; border-radius: 10px; background: white; cursor: pointer; }
button:disabled { opacity: .6; cursor: default; }
.link { border: none; text-decoration: underline; padding: 6px 0; }
.muted { color: #666; }
.error { color: #b00020; margin: 0; }
</style>
