<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const props = defineProps({
  householdId: { type: String, required: true },
  visible: { type: Boolean, required: true }
});
const emit = defineEmits(['update:visible']);
const router = useRouter();

const onContinue = async () => {
  try {
    localStorage.removeItem('isNewUser');
    emit('update:visible', false);
    await router.replace(`/dashboard/representative/household/${props.householdId}`);
  } catch (error) { console.error('Navigation error:', error); }
};

const onSkip = () => { localStorage.removeItem('isNewUser'); emit('update:visible', false); };
</script>

<template>
  <Dialog :visible="visible" modal :closable="false" :style="{ width: '30rem' }" class="household-modal" @update:visible="(val) => emit('update:visible', val)">
    <template #header>
      <h3 class="m-0">¡Bienvenido!</h3>
    </template>
    <div class="flex flex-column align-items-center">
      <i class="pi pi-check-circle text-4xl text-green-500 mb-3"></i>
      <p class="text-center mb-4">Se ha creado el ID de su hogar. Para configurarlo haga clic en Continuar, o seleccione Omitir para ir al panel principal.</p>
      <p class="font-bold mb-4">ID del Hogar: {{ householdId }}</p>
    </div>
    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Omitir" class="p-button-outlined" @click="onSkip" />
        <Button label="Continuar" @click="onContinue" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
:deep(.p-dialog) { box-shadow: 0 4px 20px rgba(0,0,0,.1); border-radius: 12px; }
:deep(.p-dialog-header) { padding:1.5rem; }
:deep(.p-dialog-content) { padding:2rem; }
:deep(.p-dialog-footer) { padding:1.5rem; }
</style>

