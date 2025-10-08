<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { HouseholdService } from '@/households/infrastructure/household.service';
import { Household } from '@/households/domain/model/household.entity';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const household = ref(new Household());
const isCreateMode = computed(() => String(route.params.id || '').toLowerCase() === 'new');
const currentUser = ref(null);
const isFreePlan = computed(() => (currentUser.value?.plan || 'FREE') === 'FREE');
const maxMembers = computed(() => (isFreePlan.value ? 3 : null));
const currencies = ref([
  { label: 'Soles (PEN)', value: 'PEN' },
  { label: 'Dólares (USD)', value: 'USD' },
  { label: 'Euros (EUR)', value: 'EUR' }
]);
const loading = ref(false);
const errors = ref({});

onMounted(async () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('No se encontró información del usuario');
    const user = JSON.parse(userData);
    currentUser.value = user;
    loading.value = true;

    if (isCreateMode.value) {
      household.value = new Household({
        name: '',
        description: '',
        memberCount: 1,
        startDate: new Date(),
        currency: 'PEN',
        representativeId: user.id,
        createdAt: new Date()
      });
      return;
    }

    const id = decodeURIComponent(route.params.id);
    const loadedHousehold = await HouseholdService.getHouseholdById(id);
    if (!loadedHousehold) throw new Error('No se encontró el hogar');
    if (loadedHousehold.representativeId !== user.id) throw new Error('No tienes permiso para editar este hogar');

    household.value = new Household({
      ...loadedHousehold,
      startDate: loadedHousehold.startDate ? new Date(loadedHousehold.startDate) : new Date(),
      memberCount: Math.max(1, loadedHousehold.memberCount || 1),
      currency: loadedHousehold.currency || 'USD'
    });
    if (isFreePlan.value && household.value.memberCount > 3) {
      household.value.memberCount = 3;
      toast.add({ severity: 'info', summary: 'Límite del plan Free', detail: 'El plan Free permite hasta 3 miembros.', life: 3000 });
    }
  } catch (error) {
    console.error('Error loading household:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo cargar el hogar', life: 3000 });
    await router.replace('/dashboard/representative/households');
  } finally {
    loading.value = false;
  }
});

const validateHousehold = () => {
  errors.value = {};
  if (!household.value.name?.trim()) errors.value.name = 'El nombre del hogar es requerido';
  if (!household.value.startDate) errors.value.startDate = 'La fecha de inicio es requerida';
  if (!household.value.currency?.trim()) errors.value.currency = 'La moneda es requerida';
  if (!household.value.memberCount || household.value.memberCount < 1)
    errors.value.memberCount = 'El número de miembros debe ser al menos 1';
  if (isFreePlan.value && household.value.memberCount > 3)
    errors.value.memberCount = 'Con el plan Free puedes registrar hasta 3 miembros';
  if (Object.keys(errors.value).length > 0) throw errors.value;
};

async function saveHousehold() {
  try {
    loading.value = true;
    validateHousehold();

    const householdToSave = {
      ...household.value,
      name: household.value.name.trim(),
      description: household.value.description?.trim() || '',
      memberCount: Math.max(1, isFreePlan.value ? Math.min(3, household.value.memberCount) : household.value.memberCount),
      currency: household.value.currency.trim().toUpperCase(),
      startDate: household.value.startDate instanceof Date ? household.value.startDate.toISOString() : new Date(household.value.startDate).toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isCreateMode.value) {
      const user = JSON.parse(localStorage.getItem('user'));
      if ((user?.plan || 'FREE') === 'FREE') {
        const existing = await HouseholdService.getHouseholds(user.id);
        if (Array.isArray(existing) && existing.length >= 1) {
          toast.add({ severity: 'warn', summary: 'Límite del plan Free', detail: 'El plan Free permite solo 1 hogar.', life: 3500 });
          await router.replace('/dashboard/representative/households');
          return;
        }
      }
      await HouseholdService.createHousehold(householdToSave);
    } else {
      await HouseholdService.updateHousehold(householdToSave.id, householdToSave);
    }

    toast.add({ severity: 'success', summary: 'Éxito', detail: isCreateMode.value ? 'Hogar creado correctamente' : 'Hogar actualizado correctamente', life: 3000 });
    await router.replace('/dashboard/representative/households');
  } catch (error) {
    console.error('Error saving household:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: error.message || 'No se pudo guardar el hogar', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function cancel() { router.replace('/dashboard/representative/households'); }
</script>

<template>
  <div class="card">
    <Toast />
    <h2 class="mb-4">{{ isCreateMode ? 'Crear Hogar' : 'Editar Hogar' }}</h2>
    <form @submit.prevent="saveHousehold" class="flex flex-column gap-3">
      <div class="field">
        <label for="id">ID del Hogar</label>
        <InputText id="id" v-model="household.id" disabled class="w-full" />
      </div>
      <div class="field">
        <label for="name">Nombre del Hogar*</label>
        <InputText id="name" v-model="household.name" :class="{'p-invalid': errors.name}" class="w-full" />
        <small class="p-error" v-if="errors.name">{{ errors.name }}</small>
      </div>
      <div class="field">
        <label for="description">Descripción</label>
        <Textarea id="description" v-model="household.description" rows="3" class="w-full" />
      </div>
      <div class="field">
        <label for="memberCount">Número de Miembros*</label>
        <InputNumber id="memberCount" v-model="household.memberCount" :min="1" :max="maxMembers ?? undefined" class="w-full" />
        <small class="p-error" v-if="errors.memberCount">{{ errors.memberCount }}</small>
        <small v-else-if="isFreePlan" class="text-600">Plan Free: hasta 3 miembros.</small>
      </div>
      <div class="field">
        <label for="startDate">Fecha de Inicio</label>
        <Calendar id="startDate" v-model="household.startDate" dateFormat="yy-mm-dd" :showTime="true" :showIcon="true" class="w-full" />
      </div>
      <div class="field">
        <label for="currency">Moneda*</label>
        <Dropdown id="currency" v-model="household.currency" :options="currencies" optionLabel="label" optionValue="value" class="w-full" />
        <small class="p-error" v-if="errors.currency">{{ errors.currency }}</small>
      </div>
      <div class="flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" class="p-button-outlined" @click="cancel" :disabled="loading" />
        <Button type="submit" :label="isCreateMode ? 'Crear' : 'Actualizar'" :loading="loading" />
      </div>
    </form>
  </div>
</template>

<style scoped>
.card { background: var(--surface-card); padding: 2rem; border-radius: 10px; margin-bottom: 1rem; }
.field { margin-bottom: 1rem; }
label { display:block; margin-bottom:.5rem; font-weight:500; }
:deep(.p-inputtext), :deep(.p-dropdown), :deep(.p-calendar), :deep(.p-inputnumber) { width: 100%; }
</style>

