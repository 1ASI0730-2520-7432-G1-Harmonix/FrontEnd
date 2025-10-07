<script setup lang="js">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';

import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
import RadioButton from 'primevue/radiobutton';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirm = ref('');
const accept = ref(false);
const userType = ref('representative');
const householdId = ref('');

const error = ref('');
const success = ref('');
const generatedHouseholdId = ref('');

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function validateHouseholdId(id) {
  try {
    const response = await httpInstance.get(`/households?id=${id}`);
    return response.data.length > 0;
  } catch (err) {
    return false;
  }
}

async function signUp() {
  error.value = '';
  success.value = '';
  generatedHouseholdId.value = '';

  // Common validations
  if (!name.value.trim()) return (error.value = 'Please enter your name.');
  if (!validateEmail(email.value)) return (error.value = 'Enter a valid email address.');
  if (password.value.length < 8) return (error.value = 'Password must be at least 8 characters.');
  if (password.value !== confirm.value) return (error.value = 'Passwords do not match.');
  
  // Representative specific validation
  if (userType.value === 'representative' && !accept.value) {
    return (error.value = 'You must accept the Terms & Privacy Policy.');
  }
  
  // Member specific validation
  if (userType.value === 'member') {
    if (!householdId.value) {
      return (error.value = 'Please enter the Household ID.');
    }
    const isValid = await validateHouseholdId(householdId.value);
    if (!isValid) {
      return (error.value = 'Invalid Household ID. Please verify and try again.');
    }
  }

  try {
    const userId = Date.now();
    let userData = {
      id: userId,
      name: name.value,
      email: email.value,
      password: password.value,
      role: userType.value,
      status: 'active'
    };

    if (userType.value === 'representative') {
      const newHouseholdId = `HOG-${userId}`;
      userData.householdId = newHouseholdId;
      
      // Create household
      await httpInstance.post('/households', {
        id: newHouseholdId,
        representativeId: userId,
        createdAt: new Date().toISOString()
      });
      
      generatedHouseholdId.value = newHouseholdId;
    } else {
      userData.householdId = householdId.value;
    }

    const response = await httpInstance.post('/users', userData);
    
    if (response.status === 201) {
      if (userType.value === 'representative') {
        success.value = `Account created! Your Household ID is: ${generatedHouseholdId.value}. Save it to share with your household members.`;
      } else {
        success.value = 'Account created! You have been added to the household.';
      }
      
      setTimeout(() => {
        router.push('/login');
      }, 5000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create account. Please try again.';
  }
}
</script>

<template>
  <div class="grid h-screen">
    <!-- Left side (visual/brand) -->
    <div class="hidden md:col-6 md:flex align-items-center justify-content-center surface-ground">
      <div class="p-5 text-center">
        <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
            alt="signup hero"
            class="w-full border-round-2xl shadow-3"
            style="max-width: 560px;"
        />
        <h2 class="mt-4 mb-2">Create your account</h2>
        <p class="text-600 line-height-3">
          Join to access your dashboard, projects, and more—fast and secure.
        </p>
      </div>
    </div>

    <!-- Right side (form) -->
    <div class="col-12 md:col-6 flex align-items-center justify-content-center">
      <div class="w-full" style="max-width: 460px;">
        <div class="mb-4">
          <h1 class="m-0">Sign up</h1>
          <p class="mt-2 text-600">It only takes a minute.</p>
        </div>

        <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>
        <Message v-if="success" severity="success" :closable="false" class="mb-3">{{ success }}</Message>

        <div class="field mb-4">
          <label class="block mb-2">Account Type</label>
          <div class="flex gap-4">
            <div class="flex align-items-center">
              <RadioButton
                id="representative"
                v-model="userType"
                value="representative"
                name="userType"
              />
              <label for="representative" class="ml-2">Household Representative</label>
            </div>
            <div class="flex align-items-center">
              <RadioButton
                id="member"
                v-model="userType"
                value="member"
                name="userType"
              />
              <label for="member" class="ml-2">Household Member</label>
            </div>
          </div>
        </div>

        <div class="field mb-3">
          <label for="name" class="block mb-2">Full name</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-user" />
            <InputText id="name" v-model="name" placeholder="Jane Doe" class="w-full" autocomplete="name" />
          </span>
        </div>

        <div class="field mb-3">
          <label for="email" class="block mb-2">Email</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-envelope" />
            <InputText id="email" v-model="email" type="email" placeholder="you@example.com" class="w-full" autocomplete="email" />
          </span>
        </div>

        <div class="field mb-3">
          <label for="password" class="block mb-2">Password</label>
          <Password
              id="password"
              v-model="password"
              class="w-full"
              inputClass="w-full"
              toggleMask
              :feedback="true"
              placeholder="At least 8 characters"
              autocomplete="new-password"
          />
        </div>

        <div class="field mb-2">
          <label for="confirm" class="block mb-2">Confirm password</label>
          <Password
              id="confirm"
              v-model="confirm"
              class="w-full"
              inputClass="w-full"
              toggleMask
              :feedback="false"
              placeholder="Re-enter your password"
              autocomplete="new-password"
          />
        </div>

        <div v-if="userType === 'member'" class="field mb-3">
          <label for="householdId" class="block mb-2">Household ID</label>
          <span class="p-input-icon-left w-full">
            <i class="pi pi-home" />
            <InputText
              id="householdId"
              v-model="householdId"
              placeholder="Enter the ID provided by your household representative"
              class="w-full"
            />
          </span>
        </div>

        <div v-if="userType === 'representative'" class="flex align-items-start gap-2 my-3">
          <Checkbox inputId="accept" v-model="accept" :binary="true" />
          <label for="accept" class="line-height-3">
            I agree to the <a href="#" class="text-primary">Terms</a> and <a href="#" class="text-primary">Privacy Policy</a>.
          </label>
        </div>

        <Button label="Create account" class="w-full" @click="signUp" />

        <Divider align="center" type="dashed" class="my-4">
          <b class="text-600">or</b>
        </Divider>

        <Button class="w-full mb-2" outlined>
          <i class="pi pi-google mr-2" /> Continue with Google
        </Button>
        <Button class="w-full" outlined>
          <i class="pi pi-github mr-2" /> Continue with GitHub
        </Button>

        <p class="mt-4 text-600 text-center">
          Already have an account?
          <a href="#" class="text-primary"><router-link to="login">Sign in</router-link></a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(img) { object-fit: cover; }
</style>
