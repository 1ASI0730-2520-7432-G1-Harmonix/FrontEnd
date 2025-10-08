<script setup lang="js">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputSwitch from 'primevue/inputswitch'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import LanguageSwitcher from '@/shared/components/language-switcher.vue'
import { useI18n } from 'vue-i18n'
import { SettingsApi } from '@/settings/infrastructure/settings-api.js'

const { t, locale } = useI18n()

// One service instance
const service = new SettingsApi()

// Safe defaults to avoid spreading null/undefined
const defaultSettings = {
  id: '',                   // settings record id (if your API returns one)
  userId: '',               // who owns these settings
  language: locale.value || 'en',
  darkMode: false,
  notificationEnabled: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const form = ref({ ...defaultSettings })
const lastSaved = ref({ ...defaultSettings })

const saving = ref(false)
const success = ref('')
const error = ref('')

const displayLocale = computed(() =>
    (locale.value || form.value.language || '').toUpperCase()
)

function applyDarkMode(flag) {
  document.documentElement.classList.toggle('dark', !!flag)
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

const isDirty = computed(
    () => JSON.stringify(form.value) !== JSON.stringify(lastSaved.value)
)

onMounted(async () => {
  try {
    const userData = localStorage.getItem('user')
    if (!userData) throw new Error('There is no user data!')

    const userId = JSON.parse(userData).id;

    console.log("UserId:",userId)

    // Load settings by user id (adjust if API expects another key)
    const loaded = await service.getByUserId(userId)

    // If nothing came back, hydrate from defaults with userId
    const settings = loaded ?? { ...defaultSettings, userId }

    form.value = { ...settings }
    console.log('Form:',form.value.data[0].id);
    console.log("ID:", form.value.id);
    lastSaved.value = { ...settings }

    // sync i18n locale & dark mode
    if (settings.language) locale.value = settings.language
    applyDarkMode(settings.darkMode)
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to load settings.'
  }
})

async function save() {
  success.value = ''
  error.value = ''
  saving.value = true

  try {
    // Apply language from the switcher to be persisted
    form.value.language = locale.value
    form.value.updatedAt = new Date().toISOString()
    let saved
    if (form.value.id) {
      console.log("Id:",form.value.id)
      saved = await service.update(form.value.id, form.value)
    } else {
      saved = await service.create(form.value)
    }

    // Refresh local state with authoritative server copy
    form.value = { ...saved }
    lastSaved.value = { ...saved }

    // Reflect dark mode visually
    applyDarkMode(form.value.darkMode)

    success.value = 'Settings saved successfully.'
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Could not save settings. Please try again.'
  } finally {
    saving.value = false
  }
}

function reset() {
  form.value = { ...lastSaved.value }
  locale.value = form.value.language
  success.value = ''
  error.value = ''
  applyDarkMode(form.value.darkMode)
}
</script>

<template>
  <div class="settings-home">
    <div class="mb-4 flex align-items-center justify-content-between">
      <div>
        <h2 class="m-0">{{ $t('settings.title') }}</h2>
        <p class="mt-1 text-600">{{ $t('settings.subtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <Tag value="User" icon="pi pi-user" />
        <Tag severity="info" :value="`ID: ${form.value.userId || '—'}`" />
        <Tag severity="secondary" :value="form.value.id || '—'" />
      </div>
    </div>

    <div class="grid">
      <!-- Preferences Section -->
      <div class="col-12 lg:col-8">
        <Card :pt="{ root: { class: 'my-custom-card' } }">
          <template #title>{{ $t('settings.preferences') }}</template>

          <template #content>
            <div class="grid formgrid p-fluid">
              <!-- Language Switch Component -->
              <div class="field col-12 md:col-6">
                <label for="language" class="mb-2 block">{{ $t('settings.language') }}</label>
                <LanguageSwitcher />
              </div>

              <div class="field col-12 md:col-6">
                <label class="mb-2 block">{{ $t('settings.dark_mode') }}</label>
                <div class="flex align-items-center gap-3">
                  <!-- Enabled so user can toggle; persist on Save -->
                  <InputSwitch v-model="form.darkMode" inputId="dark-mode" />
                  <label for="dark-mode" class="m-0">{{ form.darkMode ? 'On' : 'Off' }}</label>
                </div>
              </div>

              <div class="field col-12 md:col-6">
                <label class="mb-2 block">{{ $t('settings.email_notifications') }}</label>
                <div class="flex align-items-center gap-3">
                  <InputSwitch v-model="form.notificationEnabled" inputId="notif" />
                  <label for="notif" class="m-0">{{ form.notificationEnabled ? 'Enabled' : 'Disabled' }}</label>
                </div>
              </div>
            </div>

            <Divider class="my-divider" />

            <div class="flex align-items-center justify-content-between flex-wrap gap-3">
              <div class="text-600">
                <div><i class="pi pi-clock mr-2" />{{ $t('settings.created_at') }} <b>{{ formatDate(form.createdAt) }}</b></div>
                <div class="mt-1"><i class="pi pi-refresh mr-2" />{{ $t('settings.last_updated') }} <b>{{ formatDate(form.updatedAt) }}</b></div>
              </div>

              <div class="flex gap-2">
                <Button
                    label="Reset"
                    severity="secondary"
                    outlined
                    :disabled="!isDirty"
                    @click="reset"
                    :pt="{ root: { class: 'my-custom-button' } }"
                />
                <Button
                    label="Save changes"
                    :loading="saving"
                    :disabled="!isDirty"
                    @click="save"
                />
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
        <Card :pt="{ root: { class: 'my-custom-card' } }">
          <template #title>{{ $t('settings.summary') }}</template>
          <template #content>
            <ul class="list-none m-0 p-0">
              <li class="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border custom-divider">
                <span class="text-600">{{ $t('settings.language') }}</span>
                <b>{{ displayLocale }}</b>
              </li>
              <li class="flex align-items-center justify-content-between py-2 border-bottom-1 surface-border custom-divider">
                <span class="text-600">{{ $t('settings.dark_mode') }}</span>
                <b>{{ form.darkMode ? 'On' : 'Off' }}</b>
              </li>
              <li class="flex align-items-center justify-content-between py-2">
                <span class="text-600">{{ $t('settings.notifications') }}</span>
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
.my-custom-card {
  background-color: #2c3e50;
}
.my-custom-button {
  background-color: black;
}

/* PrimeVue Divider internals (scoped) */
:deep(.my-divider.p-divider-horizontal)::before {
  border-top-color: rgba(255, 255, 255, 0.1) !important;
}
:deep(.my-divider.p-divider-vertical)::before {
  border-left-color: rgba(255, 255, 255, 0.1) !important;
}

/* Optional: tweak list dividers */
.custom-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.settings-home {
  animation: fadeIn 0.5s ease-in-out;
  padding: 1rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
