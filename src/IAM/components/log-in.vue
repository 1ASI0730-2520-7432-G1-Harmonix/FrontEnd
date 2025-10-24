<script setup lang="js">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';

// PrimeVue components
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';

const router = useRouter();
const email = ref('');
const password = ref('');
const remember = ref(false);
const error = ref('');

async function signIn() {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Please fill in your email and password.';
    return;
  }

  console.log("email", email.value);

  try {
    // Find user by email
    const response = await httpInstance.get(`/users?email=${email.value}`);
    const users = response.data;

    if (users.length === 0) {
      error.value = 'Invalid email or password.';
      return;
    }

    const user = users[0];
    if (user.password !== password.value) {
      error.value = 'Invalid email or password.';
      return;
    }

    // Store user info in localStorage
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      householdId: user.householdId,
      isNewUser: user.isNewUser,
      plan: user.plan || 'FREE'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));

    // Check if this is a new user
    if (user.role === 'representative' && user.isNewUser) {
      localStorage.setItem('isNewUser', 'true');
      
      // Update user to no longer be new
      await httpInstance.patch(`/users/${user.id}`, { isNewUser: false });
    }

    // Redirect based on role
    if (user.role === 'representative') {
      await router.push({name: 'representative-dashboard'});
    } else {
      await router.push({name: 'member-dashboard'});
    }

  } catch (err) {
    error.value = 'An error occurred while signing in. Please try again.';
    console.error('Sign in error:', err);
  }
}
</script>

<template>
  <!-- Full height split layout -->
  <div class="grid h-screen" style="background-color: white !important;">
    <!-- Left side (image / brand) -->
    <div class="hidden md:col-6 md:flex align-items-center justify-content-center surface-ground" style="background-color: white !important;">
      <div class="p-5 text-center">
        <!-- Replace with your own image -->
        <img
            src="@/assets/logo.jpeg"
            alt="auth hero"
            class="w-full border-round-2xl shadow-3"
            style="max-width: 560px;"
        />
        <h2 class="mt-4 mb-2" style="color: black">Welcome back</h2>
        <p class="text-600 line-height-3" style="color: black !important;">
          Sign in to continue to your dashboard and pick up where you left off.
        </p>
      </div>
    </div>

    <!-- Right side (form) -->
    <div class="col-12 md:col-6 flex align-items-center justify-content-center" style="background-color: #2c3e50">
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
            <a href="#" class="text-primary"><router-link to="forgot-password">Forgot password?</router-link></a>
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

        <div class="custom-divider">
          <span>or</span>
        </div>


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
          <a href="#" class="text-primary"><router-link to="signup">Create one</router-link></a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.custom-divider::before,
.custom-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px dashed #ccc; /* customize color or style */
}

.custom-divider::before {
  margin-right: 1rem;
}

.custom-divider::after {
  margin-left: 1rem;
}

.custom-divider span {
  font-weight: 600;
  color: white;
}
/* Optional: slightly softer card look on the image side */
:deep(img) {
  object-fit: cover;
}
</style>
