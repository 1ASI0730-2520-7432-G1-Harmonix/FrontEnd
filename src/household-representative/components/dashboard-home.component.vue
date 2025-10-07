<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';

const router = useRouter();
const user = ref(null);
const totalMembers = ref(0);
const totalExpenses = ref(0);
const totalContributions = ref(0);
const loading = ref(true);

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    await loadDashboardData();
  }
  loading.value = false;
});

async function loadDashboardData() {
  try {
    const [members, expenses, contributions] = await Promise.all([
      httpInstance.get(`/users?householdId=${user.value.householdId}`),
      httpInstance.get(`/expenses?householdId=${user.value.householdId}`),
      httpInstance.get(`/contributions?householdId=${user.value.householdId}`)
    ]);
    
    totalMembers.value = members.data.length;
    totalExpenses.value = expenses.data.reduce((sum, e) => sum + e.amount, 0);
    totalContributions.value = contributions.data.reduce((sum, c) => sum + c.amount, 0);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

function navigateTo(route) {
  router.push(route);
}
</script>

<template>
  <div class="dashboard-home">
    <div v-if="loading" class="loader">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando información...</p>
    </div>

    <template v-else>
      <!-- Welcome Section -->
      <div class="surface-card p-4 shadow-2 border-round mb-3">
        <div class="flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 class="text-4xl font-bold text-900 m-0">Bienvenido, {{ user?.name }}</h2>
            <p class="text-xl mt-3 mb-0 text-700 line-height-3">
              Household Representative Dashboard
            </p>
          </div>
          <div class="surface-200 p-3 border-round">
            <p class="m-0 font-medium"><strong>ID del Hogar:</strong> {{ user?.householdId }}</p>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid mt-3">
        <div class="col-12 md:col-6 lg:col-4">
          <div class="surface-card p-3 shadow-2 border-round h-full">
            <div class="flex flex-column">
              <span class="p-3 surface-200 border-round mb-4" style="width: fit-content">
                <i class="pi pi-users text-primary" style="font-size: 2rem"></i>
              </span>
              <h3 class="text-2xl font-medium mb-2">Total Miembros</h3>
              <p class="text-3xl text-primary font-bold m-0">{{ totalMembers }}</p>
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-4">
          <div class="surface-card p-3 shadow-2 border-round h-full">
            <div class="flex flex-column">
              <span class="p-3 surface-200 border-round mb-4" style="width: fit-content">
                <i class="pi pi-wallet text-primary" style="font-size: 2rem"></i>
              </span>
              <h3 class="text-2xl font-medium mb-2">Gastos Totales</h3>
              <p class="text-3xl text-primary font-bold m-0">S/ {{ totalExpenses.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-4">
          <div class="surface-card p-3 shadow-2 border-round h-full">
            <div class="flex flex-column">
              <span class="p-3 surface-200 border-round mb-4" style="width: fit-content">
                <i class="pi pi-chart-bar text-primary" style="font-size: 2rem"></i>
              </span>
              <h3 class="text-2xl font-medium mb-2">Aportes Totales</h3>
              <p class="text-3xl text-primary font-bold m-0">S/ {{ totalContributions.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid mt-3">
        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center cursor-pointer hover:shadow-2 transition-all transition-duration-300 h-full"
               @click="navigateTo('/dashboard/representative/members')">
            <span class="inline-flex align-items-center justify-content-center surface-200 border-round mb-4 p-3">
              <i class="pi pi-users text-primary" style="font-size: 2rem"></i>
            </span>
            <h4 class="text-xl font-medium mb-2">Gestionar Miembros</h4>
            <p class="text-700 line-height-3 m-0">Administra los miembros del hogar</p>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center cursor-pointer hover:shadow-2 transition-all transition-duration-300 h-full"
               @click="navigateTo('/dashboard/representative/expenses')">
            <span class="inline-flex align-items-center justify-content-center surface-200 border-round mb-4 p-3">
              <i class="pi pi-wallet text-primary" style="font-size: 2rem"></i>
            </span>
            <h4 class="text-xl font-medium mb-2">Gestionar Gastos</h4>
            <p class="text-700 line-height-3 m-0">Administra los gastos del hogar</p>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center cursor-pointer hover:shadow-2 transition-all transition-duration-300 h-full"
               @click="navigateTo('/dashboard/representative/contribution')">
            <span class="inline-flex align-items-center justify-content-center surface-200 border-round mb-4 p-3">
              <i class="pi pi-chart-bar text-primary" style="font-size: 2rem"></i>
            </span>
            <h4 class="text-xl font-medium mb-2">Gestionar Aportes</h4>
            <p class="text-700 line-height-3 m-0">Administra los aportes del hogar</p>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-3">
          <div class="surface-card p-3 border-round shadow-1 text-center cursor-pointer hover:shadow-2 transition-all transition-duration-300 h-full"
               @click="navigateTo('/dashboard/representative/settings')">
            <span class="inline-flex align-items-center justify-content-center surface-200 border-round mb-4 p-3">
              <i class="pi pi-cog text-primary" style="font-size: 2rem"></i>
            </span>
            <h4 class="text-xl font-medium mb-2">Configuración</h4>
            <p class="text-700 line-height-3 m-0">Ajusta las preferencias del hogar</p>
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
</style>