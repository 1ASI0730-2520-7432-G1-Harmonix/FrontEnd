<script setup lang="ts">
import { ref } from 'vue';

// PrimeVue components
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';

const email = ref('');
const password = ref('');
const remember = ref(false);
const error = ref('');

function signIn() {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Please fill in your email and password.';
    return;
  }
  // TODO: replace with your auth call
  console.log({ email: email.value, password: password.value, remember: remember.value });
}
</script>

<template>
  <!-- Full height split layout -->
  <div class="grid h-screen">
    <!-- Left side (image / brand) -->
    <div class="hidden md:col-6 md:flex align-items-center justify-content-center surface-ground">
      <div class="p-5 text-center">
        <!-- Replace with your own image -->
        <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
            alt="auth hero"
            class="w-full border-round-2xl shadow-3"
            style="max-width: 560px;"
        />
        <h2 class="mt-4 mb-2">Welcome back</h2>
        <p class="text-600 line-height-3">
          Sign in to continue to your dashboard and pick up where you left off.
        </p>
      </div>
    </div>

    <!-- Right side (form) -->
    <div class="col-12 md:col-6 flex align-items-center justify-content-center">
      <div class="w-full" style="max-width: 420px;">
        <div class="mb-4">
          <h1 class="m-0">Sign in</h1>
          <p class="mt-2 text-600">Use your account credentials to continue.</p>
        </div>

        <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>

        <div class="field mb-3">
          <label for="email" class="block mb-2">Email</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-envelope" />
            <InputText
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                class="w-full"
                autocomplete="email"
            />
          </span>
        </div>

        <div class="field mb-2">
          <div class="flex align-items-center justify-content-between mb-2">
            <label for="password" class="mb-0">Password</label>
            <a href="#" class="text-primary">Forgot password?</a>
          </div>
          <Password
              id="password"
              v-model="password"
              class="w-full"
              inputClass="w-full"
              toggleMask
              :feedback="false"
              placeholder="••••••••"
              autocomplete="current-password"
          />
        </div>

        <div class="flex align-items-center justify-content-between my-3">
          <div class="flex align-items-center gap-2">
            <Checkbox inputId="remember" v-model="remember" :binary="true" />
            <label for="remember">Remember me</label>
          </div>
        </div>

        <Button label="Sign in" class="w-full" @click="signIn" />

        <Divider align="center" type="dashed" class="my-4">
          <b class="text-600">or</b>
        </Divider>

        <div class="grid">
          <div class="col-12 md:col-6">
            <Button class="w-full" outlined>
              <i class="pi pi-google mr-2" /> Google
            </Button>
          </div>
          <div class="col-12 md:col-6">
            <Button class="w-full" outlined>
              <i class="pi pi-github mr-2" /> GitHub
            </Button>
          </div>
        </div>

        <p class="mt-4 text-600 text-center">
          Don’t have an account?
          <a href="#" class="text-primary">Create one</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: slightly softer card look on the image side */
:deep(img) {
  object-fit: cover;
}
</style>
