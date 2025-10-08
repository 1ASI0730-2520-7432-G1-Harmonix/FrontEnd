<script setup>
import { ref, onMounted } from 'vue'
import { fetchHouseholdMembers, fetchHouseholdSummary } from '../services/household.service.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'

const month = ref('Agosto 2025')
const rows = ref([])
const loading = ref(true)
const error = ref('')

const summary = ref({
  totalContributed: 0,
  monthlyGoal: 0,
  progress: 0,
  contributors: 0,
  currency: 'PEN'
})

const money = (n) =>
    new Intl.NumberFormat(summary.value.currency === 'USD' ? 'en-US' : 'es-PE', {
      style: 'currency',
      currency: summary.value.currency
    }).format(n || 0)

const statusSeverity = (s) => (s === 'Cumplido' ? 'success' : s === 'Vencido' ? 'danger' : 'warn')

onMounted(load)

async function load () {
  loading.value = true
  error.value = ''
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const householdId = user?.householdId || 'HOG-1759796571919'

    const [members, kpis] = await Promise.all([
      fetchHouseholdMembers(householdId),
      fetchHouseholdSummary(householdId)
    ])

    rows.value = members
    summary.value = kpis
  } catch (e) {
    console.error(e)
    error.value = 'No se pudo cargar el estado del hogar.'
  } finally {
    loading.value = false
  }
}

function exportCSV () {
  const header = ['Miembro','Monto aportado','Monto asignado','Fecha límite','Estado']
  const lines = rows.value.map(r => [
    r.name,
    Number(r.contributed).toFixed(2),
    Number(r.assigned).toFixed(2),
    r.deadline,
    r.status
  ])
  const csv = [header, ...lines].map(a => a.join(',')).join('\n')
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'estado_hogar.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page">
    <!-- 🔒 contenedor propio (no dependemos del Card) -->
    <div class="content-card">
      <div class="header">
        <h2 class="title">Estado del hogar</h2>
        <SelectButton
            v-model="month"
            :options="['Agosto 2025','Septiembre 2025','Octubre 2025']"
            aria-label="Periodo"
            class="month"
        />
      </div>

      <hr class="sep" />

      <div class="kpi-grid">
        <div class="kpi-label">Monto total aportado:</div>
        <div class="kpi-value">{{ money(summary.totalContributed) }}</div>

        <div class="kpi-label">Meta mensual:</div>
        <div class="kpi-value">{{ money(summary.monthlyGoal) }}</div>

        <div class="kpi-label">% de cumplimiento:</div>
        <div class="kpi-value">{{ summary.progress }}%</div>

        <div class="kpi-label">N° aportadores:</div>
        <div class="kpi-value">{{ summary.contributors }}</div>
      </div>

      <hr class="sep" />

      <div class="table-top">
        <Button label="Exportar" icon="pi pi-download" class="p-button-success" @click="exportCSV" />
      </div>

      <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>

      <DataTable
          v-else
          :value="rows"
          :loading="loading"
          size="small"
          :stripedRows="true"
          :showGridlines="true"
          class="state-table"
      >
        <Column field="name" header="Miembro" :sortable="true">
          <template #body="{ data }">{{ data.name }}</template>
        </Column>

        <Column field="contributed" header="Monto aportado" :sortable="true">
          <template #body="{ data }">S/ {{ Number(data.contributed || 0).toFixed(2) }}</template>
        </Column>

        <Column field="assigned" header="Monto asignado" :sortable="true">
          <template #body="{ data }">S/ {{ Number(data.assigned || 0).toFixed(2) }}</template>
        </Column>

        <Column field="deadline" header="Fecha límite" :sortable="true">
          <template #body="{ data }">{{ data.deadline }}</template>
        </Column>

        <Column header="Estado">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="statusSeverity(data.status)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
:host {
  display: block;
  margin-left: 250px;
  padding: 1rem;
  box-sizing: border-box;
  background: transparent;
}
@media (max-width: 992px) {
  :host { margin-left: 60px; }
}

.page {
  max-width: 1100px;
  margin: 0 auto;
}

.content-card {
  background: #ffffff;
  color: #222;
  border-radius: 16px;
  border: 0;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  padding: 1.25rem 1.5rem 1.5rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  color: #1a1a1a;
}
.month :deep(.p-selectbutton) {
  border-radius: 999px;
  overflow: hidden;
}
.month :deep(.p-selectbutton .p-button) {
  padding: 0.45rem 0.9rem;
  box-shadow: none;
}

.sep {
  border: none;
  border-top: 2px solid rgba(0, 0, 0, 0.1);
  margin: 0.75rem 0 1rem;
}

.kpi-grid {
  max-width: 760px;
  display: grid;
  grid-template-columns: 280px 1fr;
  margin-bottom: 1rem;
}
.kpi-label,
.kpi-value {
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.kpi-label {
  background: #2f7fdc; /* azul */
  color: #fff;
  font-weight: 600;
  border-right: none;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}
.kpi-value {
  background: #f9f9f9;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  color: #222;
}

.table-top {
  display: flex;
  justify-content: flex-end;
  margin: 0.2rem 0 0.6rem;
}

.state-table :deep(.p-datatable-thead > tr > th) {
  background: #2f7fdc;
  color: #fff;
  font-weight: 700;
  border-color: rgba(255, 255, 255, 0.15);
}
.state-table :deep(.p-datatable-wrapper) {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.state-table :deep(.p-datatable-tbody > tr > td) {
  border-color: rgba(0, 0, 0, 0.08);
  color: #1a1a1a;
  background: #fff;
}
.state-table :deep(.p-datatable-tbody > tr:nth-child(even) > td) {
  background: #f9f9f9;
}
.state-table :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(47, 127, 220, 0.08);
}
</style>
