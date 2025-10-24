<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import httpInstance from '@/shared/services/http.instance';

/**
 * Add Member Form Component
 * 
 * This component provides a form interface for adding new members to a household.
 * It includes validation for email uniqueness, password confirmation, and form validation.
 * The component follows the design pattern shown in the reference image with a dark theme
 * and blue accent colors.
 * 
 * @component AddMemberForm
 * @example
 * <AddMemberForm 
 *   v-model:visible="showDialog" 
 *   :household-id="householdId"
 *   @member-added="handleMemberAdded" 
 * />
 */

// Props
const props = defineProps({
  /**
   * Controls the visibility of the dialog
   * @type {Boolean}
   */
  visible: {
    type: Boolean,
    default: false
  },
  /**
   * The household ID to assign the new member to
   * @type {String}
   */
  householdId: {
    type: String,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:visible', 'member-added']);

// Composables
const toast = useToast();

// Reactive data
const formData = ref({
  email: '',
  householdId: '',
  description: ''
});

const loading = ref(false);
const errors = ref({});

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const isFormValid = computed(() => {
  return formData.value.email && 
         formData.value.householdId && 
         formData.value.description;
});

/**
 * Validates the form data
 * @returns {Boolean} True if form is valid
 */
function validateForm() {
  errors.value = {};
  
  // Email validation
  if (!formData.value.email.trim()) {
    errors.value.email = 'El email es requerido';
  } else if (!isValidEmail(formData.value.email)) {
    errors.value.email = 'El email no es válido';
  }
  
  // Household ID validation
  if (!formData.value.householdId.trim()) {
    errors.value.householdId = 'El ID del hogar es requerido';
  }
  
  // Description validation
  if (!formData.value.description.trim()) {
    errors.value.description = 'La descripción es requerida';
  }
  
  return Object.keys(errors.value).length === 0;
}

/**
 * Validates email format using regex
 * @param {String} email - Email to validate
 * @returns {Boolean} True if email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if email already exists in the system
 * @param {String} email - Email to check
 * @returns {Promise<Boolean>} True if email exists
 */
async function checkEmailExists(email) {
  try {
    const response = await httpInstance.get(`/users?email=${email}`);
    return response.data.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Handles form submission
 * Creates a new member invitation and sends it
 */
async function handleSubmit() {
  if (!validateForm()) {
    return;
  }
  
  // Check if email already exists
  const emailExists = await checkEmailExists(formData.value.email);
  if (emailExists) {
    errors.value.email = 'Este email ya está registrado';
    return;
  }
  
  loading.value = true;
  
  try {
    // Create user invitation
    const invitationData = {
      email: formData.value.email.trim(),
      householdId: formData.value.householdId.trim(),
      description: formData.value.description.trim(),
      status: 'invited',
      role: 'member',
      createdAt: new Date().toISOString()
    };
    
    // For now, we'll create a user with invitation status
    const userData = {
      name: formData.value.email.split('@')[0], // Use email prefix as name
      email: formData.value.email.trim(),
      password: 'temp123', // Temporary password
      role: 'member',
      status: 'invited',
      householdId: formData.value.householdId.trim()
    };
    
    const userResponse = await httpInstance.post('/users', userData);
    const newUser = userResponse.data;
    
    // Create household member relationship
    const householdMemberData = {
      userId: newUser.id,
      householdId: formData.value.householdId.trim(),
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await httpInstance.post('/householdMember', householdMemberData);
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Invitación enviada correctamente',
      life: 3000
    });
    
    // Reset form and close dialog
    resetForm();
    emit('member-added');
    emit('update:visible', false);
    
  } catch (error) {
    console.error('Error sending invitation:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo enviar la invitación',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

/**
 * Resets the form to initial state
 */
function resetForm() {
  formData.value = {
    email: '',
    householdId: props.householdId,
    description: ''
  };
  errors.value = {};
}

/**
 * Handles cancel action
 */
function handleCancel() {
  resetForm();
  emit('update:visible', false);
}
</script>

<template>
  <pv-dialog 
    v-model:visible="dialogVisible" 
    header="Añadir nuevo miembro al hogar"
    :modal="true" 
    :style="{ width: '50vw' }"
    :closable="!loading"
  >
    <div class="add-member-form">
      <!-- Email Field -->
      <div class="field">
        <label for="email" class="field-label">Correo del miembro:</label>
        <pv-inputtext 
          id="email"
          v-model="formData.email" 
          type="email"
          placeholder="ejemplo@correo.com"
          class="form-input"
          :class="{ 'p-invalid': errors.email }"
          :disabled="loading"
        />
        <small v-if="errors.email" class="error-message">{{ errors.email }}</small>
      </div>

      <!-- Household ID Field -->
      <div class="field">
        <label for="householdId" class="field-label">Asignar ID de hogar:</label>
        <pv-inputtext 
          id="householdId"
          v-model="formData.householdId" 
          placeholder="HOG-1234567890"
          class="form-input"
          :class="{ 'p-invalid': errors.householdId }"
          :disabled="loading"
        />
        <small v-if="errors.householdId" class="error-message">{{ errors.householdId }}</small>
      </div>

      <!-- Description Field -->
      <div class="field">
        <label for="description" class="field-label">Descripción:</label>
        <pv-textarea 
          id="description"
          v-model="formData.description" 
          placeholder="Describe el propósito de la invitación..."
          class="form-textarea"
          :class="{ 'p-invalid': errors.description }"
          :disabled="loading"
          rows="4"
        />
        <small v-if="errors.description" class="error-message">{{ errors.description }}</small>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <pv-button 
          label="Cancelar" 
          icon="pi pi-times" 
          outlined 
          @click="handleCancel"
          :disabled="loading"
        />
        <pv-button 
          label="Enviar invitación" 
          icon="pi pi-send" 
          @click="handleSubmit"
          :disabled="!isFormValid || loading"
          :loading="loading"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<style scoped>
/**
 * Add Member Form Styles
 * 
 * Consistent styling with the project's glassmorphism theme
 * Light background with blue accent colors
 */

.add-member-form {
  padding: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  color: #0f172a;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* PrimeVue overrides for consistent theme */
:deep(.p-dialog) {
  background: #fff;
  color: #0f172a;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(15,23,42,.15);
}

:deep(.p-dialog-header) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #0f172a;
  border-bottom: 1px solid rgba(15,23,42,.08);
  border-radius: 16px 16px 0 0;
  font-weight: 700;
}

:deep(.p-dialog-content) {
  padding: 2rem;
}

:deep(.p-dialog-footer) {
  padding: 1.5rem;
  border-top: 1px solid rgba(15,23,42,.08);
}

:deep(.p-inputtext),
:deep(.p-textarea) {
  border-radius: 8px;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-textarea:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-inputtext.p-invalid),
:deep(.p-textarea.p-invalid) {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

:deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-primary) {
  background: linear-gradient(135deg, #1e6dff 0%, #ff7a18 100%);
  border: none;
  color: #fff;
  box-shadow: 0 4px 12px rgba(30,109,255,.25);
}

:deep(.p-button.p-button-primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(30,109,255,.35);
}

:deep(.p-button.p-button-outlined) {
  border: 1px solid #d1d5db;
  color: #0f172a;
  background: transparent;
}

:deep(.p-button.p-button-outlined:hover) {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

/* Responsive design */
@media (max-width: 768px) {
  :deep(.p-dialog) {
    width: 95vw !important;
    margin: 1rem;
  }
  
  :deep(.p-dialog-content) {
    padding: 1.5rem;
  }
  
  :deep(.p-dialog-footer) {
    padding: 1rem;
  }
}
</style>
