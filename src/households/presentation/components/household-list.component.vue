<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { HouseholdService } from '@/households/infrastructure/household.service';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const households = ref([]);
const loading = ref(false);
const canCreate = ref(true);

onMounted(async () => {
  await loadHouseholds();
});

async function loadHouseholds() {
  try {
    loading.value = true;
    const user = JSON.parse(localStorage.getItem('user'));
    households.value = await HouseholdService.getHouseholds(user.id);
    const plan = user?.plan || 'FREE';
    canCreate.value = !(plan === 'FREE' && households.value.length >= 1);
  } catch (error) {
    console.error('Error loading households:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

async function editHousehold(household) {
  try {
    if (!household?.id) {
      toast.add({ severity: 'warn', summary: 'Atención', detail: 'El hogar no tiene un ID válido', life: 3000 });
      return;
    }
    await router.push({
      name: 'household-edit',
      params: { id: household.id }
    });
  } catch (error) {
    console.error('Error navigating to household:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo abrir el hogar', life: 3000 });
  }
}

function newHousehold() {
  if (!canCreate.value) return;
  router.push({ name: 'household-edit', params: { id: 'new' } });
}

function confirmDelete(household) {
  confirm.require({
    message: `¿Está seguro que desea eliminar el hogar "${household.name}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteHousehold(household),
    reject: () => {
      toast.add({ severity: 'info', summary: 'Cancelado', detail: 'Operación cancelada', life: 3000 });
    }
  });
}

async function deleteHousehold(household) {
  try {
    loading.value = true;
    await HouseholdService.deleteHousehold(household.id);
    await loadHouseholds();
    toast.add({ severity: 'success', summary: 'Éxito', detail: 'Hogar eliminado correctamente', life: 3000 });
  } catch (error) {
    console.error('Error deleting household:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el hogar', life: 3000 });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="card">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>Hogares</h2>
      <Button label="Crear hogar" icon="pi pi-plus" @click="newHousehold" :disabled="!canCreate" />
    </div>

    <DataTable
      :value="households"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20]"
      responsiveLayout="scroll"
      class="p-datatable-sm households-table"
    >
      <Column header="#" style="width:3.5rem; text-align:center">
        <template #body="slotProps">{{ (slotProps.index ?? 0) + 1 }}</template>
      </Column>
      <Column field="id" header="ID" sortable />
      <Column field="name" header="Nombre" sortable />
      <Column field="description" header="Descripción" />
      <Column field="memberCount" header="Miembros" sortable />
      <Column field="startDate" header="Fecha de inicio" sortable>
        <template #body="slotProps">{{ formatDate(slotProps.data.startDate) }}</template>
      </Column>
      <Column field="currency" header="Moneda" sortable />
      <Column header="Acciones" :exportable="false" style="min-width:8rem">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              class="p-button-success"
              @click="editHousehold(slotProps.data)"
              :loading="loading"
            />
            <Button
              icon="pi pi-trash"
              rounded
              outlined
              severity="danger"
              @click="confirmDelete(slotProps.data)"
              :disabled="loading"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Toast />
    <ConfirmDialog />
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

/* Households table — modern soft look */
:deep(.households-table) {
  border-radius: 16px;
  overflow: hidden;
  /* Glassy panel */
  background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.35) 100%);
  border: 1px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  box-shadow: 0 18px 40px rgba(15,23,42,.08);
}

:deep(.households-table .p-datatable-header) {
  background: transparent;
  border: none;
}

:deep(.households-table .p-datatable-thead > tr > th) {
  background: linear-gradient(180deg, rgba(245,247,251,0.8) 0%, rgba(245,247,251,0.6) 100%);
  color: #334155;
  font-weight: 700;
  font-size: .92rem;
  padding: 14px 18px;
  border: 1px solid rgba(226,232,240,0.8);
}

:deep(.households-table .p-datatable-tbody > tr > td) {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(226,232,240,0.9);
  border-top: none; border-left: none; border-right: none;
  background: rgba(255,255,255,0.96);
}

:deep(.households-table .p-datatable-tbody > tr) {
  background: transparent;
  transition: transform .15s ease, box-shadow .15s ease;
}

:deep(.households-table .p-datatable-tbody > tr:hover) {
  box-shadow: 0 10px 22px rgba(15,23,42,.06);
}

/* Round the row by radiusing the outer cells */
:deep(.households-table .p-datatable-tbody > tr > td:first-child) {
  border-top-left-radius: 14px;
  border-bottom-left-radius: 14px;
}
:deep(.households-table .p-datatable-tbody > tr > td:last-child) {
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
}

/* Paginator */
:deep(.households-table .p-paginator) {
  background: transparent;
  border: none;
  padding: 12px;
}

:deep(.households-table .p-paginator .p-paginator-page) {
  border-radius: 999px;
}

:deep(.households-table .p-paginator .p-dropdown) {
  border-radius: 10px;
}

/* Action buttons look */
:deep(.households-table .p-button.p-button-success.p-button-outlined) {
  background: #e8fbf1;
  border-color: transparent;
  color: #16a34a;
  box-shadow: 0 2px 8px rgba(34,197,94,.18);
}

:deep(.households-table .p-button.p-button-danger.p-button-outlined) {
  background: #ffecec;
  border-color: transparent;
  color: #b91c1c;
  box-shadow: 0 2px 8px rgba(239,68,68,.18);
}

/* Green numeric tone for Miembros column (now 5th due to # column) */
:deep(.households-table .p-datatable-tbody > tr > td:nth-child(5)) {
  color: #ff8c3a;
  font-weight: 700;
}

/* Title spacing to match reference */
.card > .flex h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.card > .flex Button:deep(.p-button) {
  border-radius: 10px;
}

/* Small avatar/icon spaces to mimic reference badges (optional placeholder) */
:deep(.households-table .id-cell) {
  display:flex; align-items:center; gap:10px;
}
</style>
