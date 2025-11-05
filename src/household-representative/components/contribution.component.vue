<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Toolbar from 'primevue/toolbar'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

import { HouseholdAPI, http as localHttp } from '@/household-member/infrastructure/household.api.js'

const { t } = useI18n()

const householdId = ref('')
const plan = ref('')

const loading = ref(false)
const error = ref('')
const success = ref('')

// Tabla 1 (FREE): resumen del representante
const monthlyTotal = ref(0)
const rows = ref([{ lastIncome: 0, myTotal: 0, compliance: 0, memberCount: 0, memberId: '' }])

// Modal para registrar "ingreso" como aporte (memberContribution)
const editVisible = ref(false)
const editAmount = ref(0)
const editingRow = ref(null)
const activeContributionId = ref('')

// Tabla 2 (informativa): distribuci贸n proporcional acumulativa
const allocRows = ref([])
const memberTotals = ref([])
// Contribuci贸n (煤ltima) por billId
const contribByBill = ref(new Map())
const billsRef = ref([])

// Agrupar por bill para mostrarlos en pesta帽as
const allocByBill = computed(() => {
  const map = new Map()
  for (const r of allocRows.value || []) {
    const key = `${r.billId}||${r.billDesc}`
    if (!map.has(key)) {
      map.set(key, {
        billId: r.billId,
        billDesc: r.billDesc,
        billAmount: r.billAmount,
        paymentDay: r.paymentDay,
        rows: []
      })
    }
    map.get(key).rows.push(r)
  }
  // agregar deadline si existe contribucion
  for (const v of map.values()) {
    v.deadlineForMembers = contribByBill.value.get(String(v.billId || ''))?.deadlineForMembers || null
  }
  const arr = Array.from(map.values())
  arr.sort((a,b)=> String(a.paymentDay||'').localeCompare(String(b.paymentDay||'')) || String(a.billId).localeCompare(String(b.billId)))
  return arr
})

// Grupos que tienen una contribuci髇 creada (para renderizar una "ventana" por bill)
const groupsWithContribution = computed(() => {
  const groups = allocByBill.value || []
  const byId = new Map(groups.map(g => [String(g.billId), g]))
  const bills = billsRef.value || []
  const result = []
  const map = contribByBill.value || new Map()
  for (const [billId, c] of map.entries()) {
    const id = String(billId || '')
    let g = byId.get(id)
    if (!g) {
      const b = bills.find(x => String(x.id) === id)
      if (b) {
        g = { billId: b.id, billDesc: b.description, billAmount: Number(b.amount || 0), paymentDay: b.paymentDay || '', rows: [] }
      }
    }
    if (g) {
      g.deadlineForMembers = c?.deadlineForMembers || g.deadlineForMembers || null
      result.push(g)
    }
  }
  result.sort((a,b)=> String(a.paymentDay||'').localeCompare(String(b.paymentDay||'')) || String(a.billId).localeCompare(String(b.billId)))
  return result
})

  const currentGroup = computed(() => {
  const arr = allocByBill.value || []
  if (!arr.length) return null
  // Try to focus on bill with last/active contribution
  for (const [_, c] of (contribByBill.value || new Map()).entries()) {
    const g = arr.find(x => String(x.billId) === String(c.billId))
    if (g) return g
  }
  return null
  })

  // Collapsible panels per bill
  const expandedBills = ref(new Set())
  function isExpanded(id){
    return expandedBills.value.has(String(id || ''))
  }
  function toggleBill(id){
    const key = String(id || '')
    const set = new Set(expandedBills.value)
    if (set.has(key)) set.delete(key); else set.add(key)
    expandedBills.value = set
  }
function formatMoney(n){
  const num = Number(n || 0)
  return new Intl.NumberFormat(undefined, { style:'currency', currency:'PEN' }).format(num)
}
function formatDate(iso){
  try { return new Date(iso).toLocaleDateString() } catch { return iso }
}

onMounted(async () => {
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw)
      householdId.value = u?.householdId || ''
      plan.value = u?.plan || ''
    }
  } catch {}
  if (plan.value === 'FREE') await loadData()
})

async function loadData(){
  loading.value = true
  error.value = ''
  try{
    const [users, members, bills, memberContribs, contribs] = await Promise.all([
      HouseholdAPI.users(),
      HouseholdAPI.membersByHousehold(householdId.value),
      HouseholdAPI.billsByHousehold(householdId.value),
      HouseholdAPI.memberContributions(),
      HouseholdAPI.contributionsByHousehold(householdId.value)
    ])

    const u = Array.isArray(users) ? users : []
    const m = Array.isArray(members) ? members : []
    const b = Array.isArray(bills) ? bills : []
    billsRef.value = b

    monthlyTotal.value = b.reduce((s,x)=> s + Number(x?.amount || 0), 0)

    if (Array.isArray(contribs) && contribs.length) {
      const sorted = [...contribs].sort((a,b)=> String(a.updatedAt||a.createdAt||'').localeCompare(String(b.updatedAt||b.createdAt||'')))
      activeContributionId.value = sorted.at(-1)?.id || ''
      const mapp = new Map()
      for (const c of contribs) {
        const k = String(c.billId || '')
        const prev = mapp.get(k)
        const prevT = prev ? Date.parse(prev.updatedAt || prev.createdAt || 0) : -Infinity
        const curT = Date.parse(c.updatedAt || c.createdAt || 0)
        if (!prev || curT >= prevT) mapp.set(k, c)
      }
      contribByBill.value = mapp
    } else {
      activeContributionId.value = ''
      contribByBill.value = new Map()
    }

    const rep = JSON.parse(localStorage.getItem('user') || '{}')
    const repMember = m.find(mm => String(mm.userId) === String(rep?.id)) || null

    const myList = repMember ? (Array.isArray(memberContribs)?memberContribs:[]).filter(mc => String(mc.memberId) === String(repMember.id)) : []
    const myTotal = myList.reduce((a,mc)=> a + Number(mc.amount || 0), 0)
    const lastIncome = Number(repMember?.income || 0)

    const memberCount = m.length
    const compliance = monthlyTotal.value > 0 ? Number(((myTotal / monthlyTotal.value) * 100).toFixed(2)) : 0
    rows.value = [{ lastIncome, myTotal, compliance, memberCount, memberId: repMember?.id || '' }]

    await recalcAllocTable({ users: u, members: m, bills: b, memberContribs })
  }catch(e){
    console.error(e)
    error.value = e?.message || 'Could not load information'
  } finally { loading.value = false }
}

function openEdit(row){ editingRow.value = row; editAmount.value = 0; editVisible.value = true }

async function saveIncome(){
  const row = editingRow.value;
  const amount = Number(editAmount.value || 0);
  error.value = '';
  success.value = '';
  try{
    if(amount <= 0) throw new Error('Enter an amount greater than zero');
    if(!row?.memberId){
      const rep = JSON.parse(localStorage.getItem('user') || '{}');
      if(!rep?.id || !householdId.value) throw new Error('Invalid user/household');
      const now = new Date().toISOString();
      const payload = { id: `HM-${Date.now()}`, userId: String(rep.id), householdId: householdId.value, income: amount.toFixed(2), joinedAt: now, createdAt: now, updatedAt: now };
      const created = await localHttp.post('/householdMember', payload);
      row.memberId = (created?.data?.id) || payload.id;
    } else {
      await localHttp.patch(`/householdMember/${row.memberId}`, { income: amount.toFixed(2) });
    }
    success.value = 'Income updated';
    editVisible.value = false;
    await loadData();
  } catch(e){
    console.error(e);
    error.value = e?.message || 'Could not update income';
  }
}
// Crear contribuci贸n para un bill
const createContribVisible = ref(false)
const currentBill = ref(null)
const contribDesc = ref('')
const contribDeadline = ref(null)
const selectedBillId = ref('')
const billOptions = computed(() => (billsRef.value || []).map(b => ({ label: `${b.id} - ${b.description}`, value: String(b.id) })))

function openCreateContribution(group){
  currentBill.value = group
  contribDesc.value = group?.billDesc || ''
  selectedBillId.value = group?.billId ? String(group.billId) : ''
  contribDeadline.value = group?.deadlineForMembers ? new Date(group.deadlineForMembers) : null
  createContribVisible.value = true
}

async function createContribution(){
  try{
    const billId = String(selectedBillId.value || currentBill.value?.billId || '')
    if(!billId) throw new Error('Bill not selected')
    if(!householdId.value) throw new Error('Invalid householdId')
    const now = new Date().toISOString()
    const payload = {
      id: `CN-${Date.now()}`,
      billId,
      householdId: householdId.value,
      description: String(contribDesc.value || currentBill.value.billDesc || ''),
      deadlineForMembers: contribDeadline.value ? new Date(contribDeadline.value).toISOString() : null,
      strategy: 1,
      createdAt: now,
      updatedAt: now
    }
    await localHttp.post('/contributions', payload)
    success.value = 'Contribution created'
    createContribVisible.value = false
    await loadData()
  }catch(e){
    console.error(e)
    error.value = e?.message || 'Could not create contribution'
  }
}
// Recalculate proportional allocation table (informational only)
// - Assigns each bill proportionally to each member's income
// - Fills `allocRows` and `memberTotals`
async function recalcAllocTable({ users = [], members = [], bills = [], memberContribs = [] } = {}) {
  try {
    const userById = new Map((users || []).map(u => [String(u.id), u]))
    const ms = Array.isArray(members) ? members : []
    const bs = Array.isArray(bills) ? bills : []

    // Total household income (for proportions)
    const totalIncome = ms.reduce((sum, m) => sum + Number(m?.income || 0), 0)

    const rows = []
    const totalsMap = new Map() // memberId -> total assigned

    // Only include bills that currently have a contribution created
    const contributedIds = new Set(Array.from((contribByBill.value || new Map()).keys()).map(String))

    for (const bill of bs) {
      if (!contributedIds.has(String(bill?.id || ''))) continue
      const amount = Number(bill?.amount || 0)
      if (!amount || totalIncome <= 0) continue

      for (const m of ms) {
        const income = Number(m?.income || 0)
        const percent = totalIncome > 0 ? (income / totalIncome) : 0
        const assigned = amount * percent

        const u = userById.get(String(m.userId)) || {}
        rows.push({
          billId: bill?.id || '',
          billDesc: bill?.description || '',
          billAmount: amount,
          memberId: m?.id || '',
          memberName: u?.name || u?.username || String(m?.id || ''),
          incomeBefore: income,
          percent: Number((percent * 100).toFixed(2)),
          assigned: Number(assigned.toFixed(2)),
          paymentDay: bill?.paymentDay || ''
        })

        const key = String(m?.id || '')
        totalsMap.set(key, Number((totalsMap.get(key) || 0) + assigned))
      }
    }

    // Totals per member
    const totals = []
    for (const m of ms) {
      const u = userById.get(String(m.userId)) || {}
      const total = Number((totalsMap.get(String(m.id)) || 0).toFixed(2))
      totals.push({ memberId: m.id, memberName: u?.name || u?.username || String(m.id || ''), total })
    }

    allocRows.value = rows
    memberTotals.value = totals
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Could not recalculate distribution'
  }
}

</script>

<template>
  <div class="contrib-home">
    <Toolbar class="mb-3">
      <template #start>
        <div class="flex align-items-center gap-2">
          <h2 class="m-0">Contributions</h2>
          <Tag severity="info" :value="householdId || '-'" />
        </div>
      </template>
    </Toolbar>

    <template v-if="plan !== 'FREE'">
      <Message severity="warn" :closable="false">This view applies to the FREE plan.</Message>
    </template>

    <template v-else>
      <!-- Resumen: tarjetas en lugar de tabla -->
      <div class="flex justify-content-end mb-2">
        <Button size="small" label="Edit income" @click="openEdit(rows[0])" />
      </div>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-title"><i class="pi pi-dollar mr-2"></i>Income</div>
          <div class="metric-value">{{ formatMoney(rows[0]?.lastIncome || 0) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title"><i class="pi pi-percentage mr-2"></i>Compliance %</div>
          <div class="metric-value">{{ (rows[0]?.compliance || 0) + '%' }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title"><i class="pi pi-money-bill mr-2"></i>My total contribution</div>
          <div class="metric-value">{{ formatMoney(rows[0]?.myTotal || 0) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title"><i class="pi pi-users mr-2"></i>Number of household members</div>
          <div class="metric-value">{{ rows[0]?.memberCount || 0 }}</div>
        </div>
      </div>
      <Message v-if="success" severity="success" class="mt-2" :closable="false">{{ success }}</Message>
      <Message v-if="error" severity="error" class="mt-2" :closable="false">{{ error }}</Message>

      <Dialog v-model:visible="editVisible" modal header="Edit income" :style="{ width: '30rem' }">
        <div class="flex flex-column gap-3">
          <div>
            <label class="block mb-2">Amount</label>
            <InputNumber v-model="editAmount" mode="currency" currency="PEN" :min="0" :step="1" :useGrouping="true" class="w-full" />
          </div>
          <div class="flex justify-content-end gap-2">
            <Button label="Cancel" severity="secondary" @click="editVisible = false" />
            <Button label="Save" @click="saveIncome" />
          </div>
        </div>
      </Dialog>

      <!-- Panels por cada bill con contribuci髇 -->
      <h3 class="mt-5">Cumulative proportional distribution</h3>
      <div class="flex justify-content-end mb-2">
        <Button size="small" label="Add contribution" @click="openCreateContribution({})" />
      </div>
      <div class="bill-tabs-wrapper">
        <template v-if="(groupsWithContribution && groupsWithContribution.length)">
          <div v-for="g in groupsWithContribution" :key="g.billId" class="bill-panel">
            <div class="bill-header collapsible" @click="toggleBill(g.billId)" role="button" :aria-expanded="isExpanded(g.billId)">
              <div class="bill-title">{{ g.billDesc }}</div>
              <i :class="['pi', isExpanded(g.billId) ? 'pi-chevron-down' : 'pi-chevron-right']"></i>
            </div>
            <div v-show="isExpanded(g.billId)" class="bill-content">
              <DataTable :value="g.rows" class="p-datatable-sm" :emptyMessage="'No data'">
                <Column field="memberName" header="Member" />
                <Column field="incomeBefore" header="Current income">
                  <template #body="{ data }">{{ formatMoney(data.incomeBefore) }}</template>
                </Column>
                <Column field="percent" header="% Contribution">
                  <template #body="{ data }">{{ data.percent }}%</template>
                </Column>
                <Column field="assigned" header="Assigned amount">
                  <template #body="{ data }">{{ formatMoney(data.assigned) }}</template>
                </Column>
              </DataTable>
            </div>
          </div>
        </template>
        <div v-else class="empty-panel">No data</div>
      </div>
      <!-- Dialog crear contribuci贸n -->
      <Dialog v-model:visible="createContribVisible" modal header="Create contribution" :style="{ width: '36rem' }">
        <div class="flex flex-column gap-3">
          <div>
            <label class="block mb-2">Select a bill</label>
            <Dropdown class="w-full" v-model="selectedBillId" :options="billOptions" optionLabel="label" optionValue="value" placeholder="Choose a bill" />
          </div>
          <div>
            <label class="block mb-2">Description</label>
            <input class="p-inputtext p-component w-full" v-model="contribDesc" placeholder="Ex: Monthly contribution" />
          </div>
          <div>
            <label class="block mb-2">Deadline</label>
            <Calendar v-model="contribDeadline" showIcon :manualInput="true" :pt="{ input: { class: 'w-full' } }" />
          </div>
          <div class="flex justify-content-end gap-2">
            <Button label="Cancel" severity="secondary" @click="createContribVisible = false" />
            <Button label="Create" @click="createContribution" />
          </div>
        </div>
      </Dialog>

      <h4 class="mt-3">Totals by member</h4>
      <DataTable :value="memberTotals" class="p-datatable-sm" :emptyMessage="'No data'">
        <Column field="memberName" header="Member" />
        <Column field="total" header="Total assigned">
          <template #body="{ data }">{{ formatMoney(data.total) }}</template>
        </Column>
      </DataTable>
    </template>
  </div>
</template>

<style scoped>
.contrib-home { animation: fadeIn 0.5s ease-in-out; padding: 1rem; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

/* Resumen en tarjetas */
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: .5rem; }
.metric-card { background: #fff; border: 1px solid rgba(15,23,42,.06); border-radius: 12px; box-shadow: 0 8px 24px rgba(15,23,42,.06); padding: 1rem 1.25rem; }
.metric-title { font-weight: 600; color: #111827; margin-bottom: .5rem; display:flex; align-items:center; gap:.5rem; }
.metric-value { font-size: 1.25rem; color: #0f172a; }

/* Tabs estilo "ventanas" */
.bill-tabs-wrapper { margin-top: .5rem; }
.bill-panel { padding: 1rem; background: #fff; border: 1px solid #9ec9ff; border-top-left-radius: 0; border-radius: 12px; }
.bill-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; }
.bill-title { font-weight: 600; color: #1f2d3d; }
.bill-meta { display: flex; gap: 1rem; color: #475569; }

:deep(.bill-tabs .p-tabview-nav) { border: none; padding-left: .25rem; }
:deep(.bill-tabs .p-tabview-nav li .p-tabview-nav-link) {
  background: #e6f2ff; color: #1d4ed8; border: 1px solid #9ec9ff; border-bottom: none;
  border-top-left-radius: 12px; border-top-right-radius: 12px; padding: .35rem .75rem; margin-right: .35rem;
}
:deep(.bill-tabs .p-tabview-nav li.p-highlight .p-tabview-nav-link) {
  background: #ffffff; color: #0f172a; position: relative; top: 1px;
}
:deep(.bill-panel-container) { border: 1px solid #9ec9ff; border-radius: 12px; padding: 0; }

/* Panel vac铆o (mock) */
.empty-panel { display: flex; align-items: center; justify-content: center; min-height: 280px; }
/* Ocultar tabla y textos; dejar solo el bot髇 */
.bill-title { display:none; }
.bill-meta span { display:none; }

@media (min-width:0){ .bill-header{ justify-content:flex-end; } }

.metric-title .pi { font-size: 1rem; line-height: 1; }
/* Align metric icons with text */
.metric-title { display:flex; align-items:center; gap:.5rem; }
.metric-title .pi { display:inline-flex; align-items:center; justify-content:center; width:1.125rem; height:1.125rem; font-size:1.125rem; line-height:1; vertical-align:middle; margin-right:.25rem; position:relative; top:0; }
.metric-title .pi::before { line-height:1; }:deep(.bill-tabs .p-tabview-nav){ display:none !important; height:0; padding:0; margin:0; }
.bill-panel{ border-top-left-radius:12px !important; }

/* Overrides to enable collapsible bills */
.bill-panel { padding: .5rem 0 1rem 0; background: transparent; border: none; }
.bill-header.collapsible { cursor: pointer; background: #fff; border: 1px solid rgba(15,23,42,.06); border-radius: 12px; padding: .75rem 1rem; }
.bill-title { display: block; }
.bill-meta span { display: inline; }
.bill-header { justify-content: space-between !important; }
.bill-header .pi { margin-left: auto; color: #111827; font-size: 0.875rem; }
.bill-content { padding-top: .5rem; }
</style>


























