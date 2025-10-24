<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';

const router = useRouter();
const user = ref(null);
const plan = ref('FREE');
const totalMembers = ref(0);
const totalExpenses = ref(0);
const totalContributions = ref(0);
const totalHouseholds = ref(0);
const membersLimit = ref(null);
// removed insights state
const loading = ref(true);

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    plan.value = user.value?.plan || 'FREE';
    membersLimit.value = plan.value === 'FREE' ? 3 : null;
    await loadDashboardData();
  }
  loading.value = false;
});

async function loadDashboardData() {
  try {
    const [members, bills, contributions, households] = await Promise.all([
      httpInstance.get(`/users?householdId=${user.value.householdId}&role=member`),
      httpInstance.get(`/bills?householdId=${user.value.householdId}`),
      httpInstance.get(`/contributions?householdId=${user.value.householdId}`),
      httpInstance.get(`/households?representativeId=${user.value.id}`)
    ]);

    totalMembers.value = members.data.length;
    totalExpenses.value = (bills.data || []).reduce((sum, b) => sum + Number(b.amount || 0), 0);
    totalContributions.value = (contributions.data || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);
    totalHouseholds.value = Array.isArray(households.data) ? households.data.length : 0;

    // insights disabled
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function navigateTo(route) {
  router.push(route);
}

// insights helpers removed
</script>

<template>
  <div class="dashboard-home">
    <div v-if="loading" class="loader">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando información...</p>
    </div>

    <template v-else>
      <!-- Welcome Section -->
      <div class="welcome-card border-round mb-3">
        <div class="flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 class="title m-0">Bienvenido, {{ user?.name }}</h2>
            <p class="subtitle mt-2 mb-0">Administra tu hogar con claridad</p>
          </div>
          <div class="flex align-items-center gap-2">
            <span class="plan-badge" :class="plan.toLowerCase()">{{ plan === 'FREE' ? 'Plan Free' : 'Plan Premium' }}</span>
            <div class="household-pill">Hogar Primario: <strong>{{ user?.householdId }}</strong></div>
            <button class="notif-bell" title="Notificaciones" aria-label="Notificaciones" type="button">
              <i class="pi pi-bell"></i>
              <span class="dot-indicator" />
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid metric-row mt-3">
        <div class="col-12 md:col-6 lg:col-4">
          <div class="metric-card">
            <span class="metric-icon members"><i class="pi pi-users"></i></span>
            <div class="metric-content">
              <span class="metric-label">Total Miembros</span>
              <div class="metric-value">{{ totalMembers }}</div>
              <div class="metric-trend up">↑ 0% vs mes pasado</div>
            </div>
            <i class="pi pi-arrow-up-right metric-go"></i>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-4">
          <div class="metric-card">
            <span class="metric-icon expenses"><i class="pi pi-wallet"></i></span>
            <div class="metric-content">
              <span class="metric-label">Gastos Totales</span>
              <div class="metric-value">S/ {{ totalExpenses.toLocaleString() }}</div>
              <div class="metric-trend neutral">—</div>
            </div>
            <i class="pi pi-arrow-up-right metric-go"></i>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-4">
          <div class="metric-card">
            <span class="metric-icon contributions"><i class="pi pi-chart-bar"></i></span>
            <div class="metric-content">
              <span class="metric-label">Aportes Totales</span>
              <div class="metric-value">S/ {{ totalContributions.toLocaleString() }}</div>
              <div class="metric-trend up">↑ 0% acumulado</div>
            </div>
            <i class="pi pi-arrow-up-right metric-go"></i>
          </div>
        </div>
      </div>

      <!-- Quick Actions (color cards) -->
      <div class="grid mt-3">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="project-card pc-blue cursor-pointer" @click="navigateTo('/dashboard/representative/members')">
            <div class="pc-header">
              <span class="pc-icon"><i class="pi pi-users" /></span>
              <span class="pc-menu">•••</span>
            </div>
            <div class="pc-title">Gestionar Miembros</div>
            <div class="pc-sub">Administra los miembros del hogar</div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="project-card pc-orange cursor-pointer" @click="navigateTo('/dashboard/representative/expenses')">
            <div class="pc-header">
              <span class="pc-icon"><i class="pi pi-wallet" /></span>
              <span class="pc-menu">•••</span>
            </div>
            <div class="pc-title">Gestionar Gastos</div>
            <div class="pc-sub">Administra los gastos del hogar</div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="project-card pc-purple cursor-pointer" @click="navigateTo('/dashboard/representative/contribution')">
            <div class="pc-header">
              <span class="pc-icon"><i class="pi pi-chart-bar" /></span>
              <span class="pc-menu">•••</span>
            </div>
            <div class="pc-title">Gestionar Aportes</div>
            <div class="pc-sub">Administra los aportes del hogar</div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="project-card pc-teal cursor-pointer" @click="navigateTo('/dashboard/representative/settings')">
            <div class="pc-header">
              <span class="pc-icon"><i class="pi pi-cog" /></span>
              <span class="pc-menu">•••</span>
            </div>
            <div class="pc-title">Configuración</div>
            <div class="pc-sub">Ajusta las preferencias del hogar</div>
          </div>
        </div>

        <!-- Households manager -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="project-card pc-green cursor-pointer" @click="navigateTo('/dashboard/representative/households')">
            <div class="pc-header">
              <span class="pc-icon"><i class="pi pi-home" /></span>
              <span class="pc-menu">•••</span>
            </div>
            <div class="pc-title">Gestionar Hogares</div>
            <div class="pc-sub">Crea y administra tus hogares</div>
          </div>
        </div>
      </div>

      
    </template>
  </div>
</template>

<style scoped>
.dashboard-home {
  animation: fadeIn 0.5s ease-in-out;
  padding: 1rem;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.loader p {
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hover\:shadow-2:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1) !important;
  transform: translateY(-2px);
}

.transition-all {
  transition-property: all;
}

.transition-duration-300 {
  transition-duration: 300ms;
}

.cursor-pointer {
  cursor: pointer;
}

/* Metric cards themed to sidebar palette (blue → orange) */
.metric-row {}
.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid rgba(15,23,42,.06);
  border-radius: 16px;
  padding: 1rem 1rem;
  box-shadow: 0 8px 24px rgba(15,23,42,.06);
}
.metric-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 14px; color: #0b1220;
  background: linear-gradient(135deg, rgba(30,109,255,0.18) 0%, rgba(255,122,24,0.18) 100%);
}
.metric-icon i { font-size: 1.25rem; color: #0b1220; opacity: .9; }
.metric-icon.members {}
.metric-icon.expenses {}
.metric-icon.contributions {}
.metric-content { display:flex; flex-direction: column; gap:.15rem; }
.metric-label { color:#64748b; font-weight:600; font-size:.95rem; }
.metric-value { color:#0f172a; font-weight:800; font-size:1.8rem; line-height:1; }
.metric-trend { font-size:.85rem; }
.metric-trend.up { color:#22c55e; }
.metric-trend.down { color:#ef4444; }
.metric-trend.neutral { color:#94a3b8; }
.metric-go { margin-left:auto; color:#cbd5e1; }

/* Welcome header inspired by reference */
.welcome-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  padding: 1.25rem 1.5rem;
}
.welcome-card .title { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.welcome-card .subtitle { color: #6b7280; }
.dashboard-toolbar { display: flex; align-items: center; gap: .5rem; }
.dashboard-toolbar .spacer { flex: 1 1 auto; }
.dashboard-toolbar .chip { border: 1px solid rgba(15,23,42,.08); background: #fff; padding: .45rem .8rem; border-radius: 999px; color: #0f172a; }
.dashboard-toolbar .chip.ghost { background: transparent; }
.dashboard-toolbar .chip.primary { background: linear-gradient(135deg, #1e6dff 0%, #ff7a18 100%); color: #0b1220; border: none; }
.plan-badge { padding: .35rem .7rem; border-radius: 999px; font-weight: 600; font-size: .85rem; }
.plan-badge.free { background: #eef2ff; color: #1e40af; }
.plan-badge.premium { background: #fff7ed; color: #c2410c; }
.household-pill { padding: .45rem .7rem; border-radius: 999px; background: #f1f5f9; color: #0f172a; border: 1px solid rgba(15,23,42,.08); }
.notif-bell { display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:999px; background:#f1f5f9; border:1px solid rgba(15,23,42,.08); color:#0f172a; position:relative; transition: all .15s ease; }
.notif-bell:hover { background:#fff; box-shadow:0 6px 14px rgba(15,23,42,.08); transform: translateY(-1px); }
.notif-bell i { font-size: 1rem; }
.notif-bell .dot-indicator { position:absolute; top:6px; right:8px; width:8px; height:8px; border-radius:999px; background:#22c55e; box-shadow:0 0 0 2px #fff; }

/* KPI cards look */
.kpi-row {}
.kpi-card { background:#fff; border:1px solid rgba(15,23,42,.06); border-radius: 16px; padding: 1rem; box-shadow: 0 8px 24px rgba(15,23,42,.06); }
.kpi-header { display:flex; align-items:center; justify-content: space-between; color:#6b7280; margin-bottom:.5rem; }
.kpi-title { font-weight:600; }
.kpi-go { color:#cbd5e1; }
.kpi-body { display:flex; align-items:center; gap:1rem; }
.kpi-icon { width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:#eef2ff; color:#1e3a8a; }
.kpi-icon i { font-size:1.1rem; }
.kpi-value { font-size:1.6rem; font-weight:800; color:#0f172a; line-height:1; }
.kpi-sub { color:#64748b; font-size:.85rem; }
.kpi-sub.muted { color:#94a3b8; }

/* Quick actions */
.quick-actions .action-card { background:#fff; border:1px solid rgba(15,23,42,.06); border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(15,23,42,.06); transition: all .2s ease; }
.quick-actions .action-card:hover { transform: translateY(-2px); box-shadow:0 10px 22px rgba(15,23,42,.08); }
.quick-actions .icon-wrap { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:12px; background:#eef2ff; color:#1e3a8a; margin-bottom:.5rem; }
.quick-actions h4 { margin: .35rem 0; font-weight:700; color:#0f172a; }
.quick-actions p { color:#64748b; margin:0; }

/* insights styles removed */

/* Project cards (inspired reference) */
.project-card {
  position: relative;
  border-radius: 20px;
  color: #fff;
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(15,23,42,.15);
  min-height: 150px;
}
.project-card .pc-header { display:flex; align-items:center; justify-content: space-between; }
.project-card .pc-icon { width:38px; height:38px; border-radius:12px; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,.22); backdrop-filter: blur(8px); }
.project-card .pc-icon i { font-size: 1.1rem; color: #fff; }
.project-card .pc-menu { opacity:.85; letter-spacing: 2px; }
.project-card .pc-title { margin-top: .9rem; font-weight: 700; font-size: 1.1rem; }
.project-card .pc-sub { opacity:.9; margin-top:.25rem; font-size:.9rem; }

/* Color variants based on sidebar palette */
.pc-blue   { background: linear-gradient(135deg, #1e6dff 0%, #6d5bff 100%); }
.pc-orange { background: linear-gradient(135deg, #ff8c3a 0%, #ffb703 100%); }
.pc-purple { background: linear-gradient(135deg, #6d5bff 0%, #b07bff 100%); }
.pc-teal   { background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%); }
.pc-green  { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); }
</style>
