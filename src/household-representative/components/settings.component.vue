<script setup lang="js">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

import Card from 'primevue/card';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import Message from 'primevue/message';
import LanguageSwitcher from "@/shared/components/language-switcher.vue";

// Your original initial settings
const initialSettings = {
  id: 'STT-124490',
  userId: 1759796571919,
  language: 'ES',
  darkMode: true,
  notificationEnabled: false,
  createdAt: '2025-10-06T00:00:00.000Z',
  updatedAt: '2025-10-06T00:00:00.000Z'
};

// Local reactive copy
const form = ref({ ...initialSettings });
const lastSaved = ref({ ...initialSettings });

const saving = ref(false);
const success = ref('');
const error = ref('');

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const isDirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(lastSaved.value));

async function save() {
  success.value = '';
  error.value = '';
  saving.value = true;

  try {
    await new Promise((r) => setTimeout(r, 800)); // demo delay

    // Apply language from the switcher to stored settings
    form.value.language = locale.value;

    form.value.updatedAt = new Date().toISOString();
    lastSaved.value = { ...form.value };
    success.value = 'Settings saved successfully.';
  } catch (e) {
    error.value = 'Could not save settings. Please try again.';
  } finally {
    saving.value = false;
  }

  // Apply dark mode toggle visually
  document.documentElement.classList.toggle('dark', !!form.value.darkMode);
}

function reset() {
  form.value = { ...lastSaved.value };
  locale.value = form.value.language;
  success.value = '';
  error.value = '';
}
</script>

<template>
  <div class="settings-home">
    <div class="mb-4 flex align-items-center justify-content-between">
      <div>
        <h2 class="m-0">Account Settings</h2>
        <p class="mt-1 text-600">Manage your preferences and account-level options.</p>
      </div>
      <div class="flex gap-2">
        <Tag value="User" icon="pi pi-user" />
        <Tag severity="info" :value="`ID: ${form.userId}`" />
        <Tag severity="contrast" :value="form.id" />
      </div>
    </div>

    <div class="grid">
      <!-- Preferences Section -->
      <div class="col-12 lg:col-8">
        <Card>
          <template #title>Preferences</template>

          <template #content>
            <div class="grid formgrid p-fluid">
              <!-- Language Switch Component -->
              <div class="field col-12 md:col-6">
                <label for="language" class="mb-2 block">Language</label>
                <language-switcher />
              </div>

              <div class="field col-12 md:col-6">
                <label class="mb-2 block">Dark mode</label>
                <div class="flex align-items-center gap-3">
                  <InputSwitch v-model="form.darkMode" inputId="dark-mode" />
                  <label for="dark-mode" class="m-0">{{ form.darkMode ? 'On' : 'Off' }}</label>
                </div>
              </div>

              <div class="field col-12 md:col-6">
                <label class="mb-2 block">Email notifications</label>
                <div class="flex align-items-center gap-3">
                  <InputSwitch v-model="form.notificationEnabled" inputId="notif" />
                  <label for="notif" class="m-0">{{ form.notificationEnabled ? 'Enabled' : 'Disabled' }}</label>
                </div>
              </div>
            </div>

            <Divider />

            <div class="flex align-items-center justify-content-between flex-wrap gap-3">
              <div class="text-600">
                <div><i class="pi pi-clock mr-2" />Created: <b>{{ formatDate(form.createdAt) }}</b></div>
                <div class="mt-1"><i class="pi pi-refresh mr-2" />Last updated: <b>{{ formatDate(form.updatedAt) }}</b></div>
              </div>

              <div class="flex gap-2">
                <Button label="Reset" severity="secondary" outlined :disabled="!isDirty" @click="reset" />
                <Button label="Save changes" :loading="saving" :disabled="!isDirty" @click="save" />
              </div>
            </div>
          </template>
        </Card>

        <div class="mt-3">
          <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        </div>
      </div>

      <!-- Summary Sidebar -->
      <div class="col-12 lg:col-4">
        <Card>
          <template #title>Summary</template>
          <template #content>
            <ul class="list-none m-0 p-0">
              <li class="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                <span class="text-600">Language</span>
                <b>{{ locale.toUpperCase?.() || form.language }}</b>
              </li>
              <li class="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border">
                <span class="text-600">Dark mode</span>
                <b>{{ form.darkMode ? 'On' : 'Off' }}</b>
              </li>
              <li class="flex align-items-center justify-content-between py-2">
                <span class="text-600">Notifications</span>
                <b>{{ form.notificationEnabled ? 'Enabled' : 'Disabled' }}</b>
              </li>
            </ul>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-home {
  animation: fadeIn 0.5s ease-in-out;
  padding: 1rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

