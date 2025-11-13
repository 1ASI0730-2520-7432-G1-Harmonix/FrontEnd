<script setup lang="js">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputSwitch from 'primevue/inputswitch'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import LanguageSwitcher from '@/shared/components/language-switcher.vue'
import { useI18n } from 'vue-i18n'
import httpInstance from '@/shared/services/http.instance.js'

// use the Service layer from the fixed code
import { SettingsService } from '@/settings/infrastructure/settings-service.js'

const { t, locale } = useI18n()

// Safe defaults
const defaultSettings = {
  id: '',
  userId: 0,                               // number
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
const showDeleteDialog = ref(false)
const deletingAccount = ref(false)
const deleteError = ref('')
const cachedUser = ref(null)

const displayLocale = computed(() => (locale.value || form.value.language || '').toUpperCase())

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

const isDirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(lastSaved.value))

onMounted(async () => {
  try {
    const userData = localStorage.getItem('user')
    if (!userData) throw new Error('There is no user data!')

    const parsed = JSON.parse(userData)
    cachedUser.value = parsed
    const userId = Number(parsed?.id ?? 0)
    if (!userId) throw new Error('User id is invalid')

    // Load settings by user id
    const loaded = await SettingsService.getSettingsByUserId(userId).catch(() => null)

    // If nothing came back, hydrate from defaults with userId
    const settings = loaded ?? { ...defaultSettings, userId }

    form.value = { ...settings }
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
    // Persist the currently selected language
    form.value.language = locale.value
    form.value.updatedAt = new Date().toISOString()

    let saved
    if (form.value.id) {
      // Update existing
      saved = await SettingsService.updateSettings(form.value.id, {
        ...form.value,
        // ensure numeric id types
        userId: Number(form.value.userId || 0),
      })
    } else {
      // Create new
      saved = await SettingsService.createSettings({
        ...form.value,
        userId: Number(form.value.userId || 0),
        createdAt: form.value.createdAt || new Date().toISOString(),
      })
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

function openDeleteDialog() {
  deleteError.value = ''
  showDeleteDialog.value = true
}

async function deleteAccount() {
  if (deletingAccount.value) return
  deleteError.value = ''
  deletingAccount.value = true
  try {
    const userInfo = cachedUser.value || JSON.parse(localStorage.getItem('user') || '{}')
    const userId = Number(userInfo?.id || 0)
    if (!userId) throw new Error('User not found.')

    const householdId = userInfo?.householdId || ''
    if (householdId) {
      const { data } = await httpInstance.get(`/users?householdId=${encodeURIComponent(householdId)}&role=member`)
      const members = Array.isArray(data) ? data : []
      await Promise.all(
        members.map(member =>
          httpInstance.patch(`/users/${member.id}`, { status: 'inactive' })
        )
      )
    }

    await httpInstance.delete(`/users/${userId}`)
    localStorage.removeItem('user')
    showDeleteDialog.value = false
    window.location.replace('/login')
  } catch (e) {
    console.error('Failed to delete account', e)
    deleteError.value = e?.message || 'No se pudo eliminar la cuenta.'
  } finally {
    deletingAccount.value = false
  }
}
</script>

<template>
  <div class="settings-home">

    <div class="welcome-card border-round mb-3">
      <div class="flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="title m-0">{{ $t('settings.title') }}</h2>
          <p class="subtitle mt-2 mb-0">{{ $t('settings.subtitle') }}</p>
        </div>
        <div class="flex align-items-center gap-2">
          <Tag value="User" icon="pi pi-user" />
          <Tag severity="info" :value="`ID: ${form.userId || '—'}`" />
          <Tag severity="secondary" :value="form.id || '—'" />
        </div>
      </div>
    </div>

<!--    <div class="mb-4 flex align-items-center justify-content-between">-->
<!--      <div>-->
<!--        <h2 class="m-0">{{ $t('settings.title') }}</h2>-->
<!--        <p class="mt-1 text-600">{{ $t('settings.subtitle') }}</p>-->
<!--      </div>-->
<!--      <div class="flex gap-2">-->
<!--        <Tag value="User" icon="pi pi-user" />-->
<!--        <Tag severity="info" :value="`ID: ${form.userId || '—'}`" />-->
<!--        <Tag severity="secondary" :value="form.id || '—'" />-->
<!--      </div>-->
<!--    </div>-->

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

      <div class="col-12">
        <Card :pt="{ root: { class: 'danger-card my-custom-card' } }">
          <template #title>Danger zone</template>
          <template #content>
            <p class="text-600 mb-3">
              Eliminar tu cuenta inactivará todas las cuentas de los miembros registrados. Esta acción es irreversible.
            </p>
            <div class="flex align-items-center justify-content-between flex-wrap gap-3">
              <div class="text-600 small-note">
                Asegúrate de descargar cualquier dato importante antes de continuar.
              </div>
              <Button
                label="Eliminar cuenta"
                severity="danger"
                :loading="deletingAccount"
                @click="openDeleteDialog"
              />
            </div>
          </template>
        </Card>
      </div>
      <Dialog
        v-model:visible="showDeleteDialog"
        header="Eliminar cuenta"
        :modal="true"
        :style="{ width: '480px' }"
      >
        <p>¿Estás seguro de que deseas eliminar tu cuenta? Todos los miembros quedarán inactivos y perderás el acceso.</p>
        <Message v-if="deleteError" severity="error" :closable="false" class="mb-2">{{ deleteError }}</Message>
        <template #footer>
          <div class="flex gap-2">
            <Button label="Cancelar" outlined @click="showDeleteDialog = false" :disabled="deletingAccount" />
            <Button label="Eliminar" severity="danger" :loading="deletingAccount" @click="deleteAccount" />
          </div>
        </template>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
.welcome-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  padding: 1.25rem 1.5rem;
}
.welcome-card .title { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.welcome-card .subtitle { color: #6b7280; }
/* Keep cards consistent with the rest of the app theme */
.my-custom-card {
  background: #fff;
  color: #0f172a;
  border: 1px solid rgba(15,23,42,.06);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15,23,42,.06);
}
.my-custom-button { /* rely on outlined style; don't force dark bg */
  background-color: transparent;
}
.danger-card {
  border-color: rgba(248, 113, 113, 0.4) !important;
  background: #fff5f5 !important;
}
.danger-card :deep(.p-card-title) {
  color: #b91c1c;
  font-weight: 700;
}
.small-note {
  font-size: 0.85rem;
  color: #6b7280;
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
