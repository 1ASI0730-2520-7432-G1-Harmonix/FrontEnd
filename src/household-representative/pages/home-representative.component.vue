<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';
import Button from 'primevue/button';
import HouseholdModal from '@/households/presentation/components/household-modal.component.vue';
import HarmonixLogo from '@/assets/harmonix_logo.PNG';

const router = useRouter();
const user = ref(null);
const members = ref([]);
const sidebarCollapsed = ref(false);
const showHouseholdModal = ref(false);

const menuItems = [
  { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard/representative' },
  { label: 'House Holds', icon: 'pi pi-home', route: '/dashboard/representative/households' },
  { label: 'Members', icon: 'pi pi-users', route: '/dashboard/representative/members' },
  { label: 'Expenses', icon: 'pi pi-wallet', route: '/dashboard/representative/expenses' },
  { label: 'Contributions', icon: 'pi pi-chart-bar', route: '/dashboard/representative/contribution' }
];

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    await loadHouseholdMembers();
    
    // Mostrar el modal si es un usuario recién registrado
    const isNewUser = localStorage.getItem('isNewUser');
    console.log('isNewUser:', isNewUser); // Para debugging
    if (isNewUser === 'true') {
      showHouseholdModal.value = true;
      // No removemos isNewUser hasta que el usuario tome una acción en el modal
    }
  }
});

async function loadHouseholdMembers() {
  try {
    const response = await httpInstance.get(`/users?householdId=${user.value.householdId}&role=member`);
    members.value = response.data;
  } catch (error) {
    console.error('Error loading household members:', error);
  }
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function navigateTo(route) {
  router.push(route);
}

function logout() {
  localStorage.removeItem('user');
  router.push('/login');
}

async function removeMember(memberId) {
  try {
    await httpInstance.delete(`/users/${memberId}`);
    await loadHouseholdMembers();
  } catch (error) {
    console.error('Error removing member:', error);
  }
}
</script>

<template>
  <div class="layout-wrapper">
    <!-- Sidebar (futuristic glass) -->
    <aside :class="['sidebar','sidebar--light', { collapsed: sidebarCollapsed }]">
      <div class="sidebar-header">
        <img class="brand" :src="HarmonixLogo" alt="HarMoniX" @click="navigateTo('/dashboard/representative')" />
        <Button icon="pi pi-bars" text @click="toggleSidebar" class="toggle-btn" />
      </div>

      

      <ul class="menu">
        <li
          v-for="item in menuItems"
          :key="item.label"
          :class="{ active: router.currentRoute.value.path === item.route }"
          @click="navigateTo(item.route)"
        >
          <div class="pill">
            <span class="icon-hold"><i :class="item.icon"></i></span>
            <span v-if="!sidebarCollapsed" class="pill-text">{{ item.label }}</span>
          </div>
        </li>
      </ul>

      <!-- Bottom area: Settings + User card -->
      <div class="bottom-area">
        <template v-if="!sidebarCollapsed">
          <div class="settings-row" @click="navigateTo('/dashboard/representative/settings')">
            <span class="gear-bg"><i class="pi pi-cog"></i></span>
            <span class="settings-text">Settings</span>
          </div>

          <div class="user-card" v-if="user">
            <div class="info">
              <div class="name">{{ user.name }} </div>
              <div class="email">{{ user.email }}</div>
            </div>
            <button class="logout-icon" title="Cerrar sesión" @click="logout"><i class="pi pi-sign-out"></i></button>
          </div>
        </template>

        <template v-else>
          <div class="bottom-collapsed">
            <Button class="icon-btn" icon="pi pi-cog" rounded text @click="navigateTo('/dashboard/representative/settings')" />
            <Button class="icon-btn danger" icon="pi pi-sign-out" rounded text @click="logout" />
          </div>
        </template>
      </div>

      
    </aside>


    <!-- Main Content -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <HouseholdModal
      v-if="user?.householdId"
      :visible="showHouseholdModal"
      :householdId="user.householdId"
      @update:visible="showHouseholdModal = $event"
    />
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background: #ffffff; /* Fondo general blanco */
}

/* SIDEBAR (futuristic glassmorphism) */
.sidebar {
  position: sticky;
  top: 0;
  width: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* Stronger contrast so items are readable over light backgrounds */
  color: #e6ecff;
  background:
    linear-gradient(180deg, rgba(16,24,40,0.60) 0%, rgba(16,24,40,0.50) 100%),
    linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%);
  border: 1px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-radius: 18px; /* separado del borde izquierdo */
  margin-left: 24px; /* espacio desde el margen izquierdo */
  padding-bottom: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
  transition: width 0.3s ease, background 0.3s ease;
}

.sidebar.collapsed { width: 92px; }



.sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; }
.logo { display:flex; align-items:center; gap:.75rem; cursor:pointer; font-weight:700; color:#f5f7ff; font-size:1.1rem; }
.toggle-btn { color:#f5f7ff; }

.user-profile { display:flex; align-items:center; gap:1rem; padding:10px 16px; }
.user-profile img { width:46px; height:46px; border-radius:50%; object-fit:cover; box-shadow:0 4px 12px rgba(0,0,0,0.25); }
.user-profile h4 { margin:0; font-size:1rem; }
.user-profile p { margin:0; font-size:.85rem; color:#d6def8; opacity:.85; }

.menu { list-style:none; padding:8px; margin:6px 0; flex-grow:1; display:flex; flex-direction:column; gap:7px; justify-content:center; }
.menu li { cursor:pointer; }
.menu .pill {
  display:flex; align-items:center; gap:40px;
  padding:8px 12px; border-radius:12px; transition:all .2s ease;
  color:#e6ecff;
}
/* Icon container to match mock: small rounded square behind icon */
.menu .pill .icon-hold {
  width: 28px; height: 28px; border-radius: 10px;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.18);
}
.menu li .pill:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
.menu li.active .pill {
  /* Brand gradient based on HarMoniX palette (blue → orange) */
  background: #001b2e;
  color:#f3f3f3;
  box-shadow: 0 8px 20px rgba(166, 195, 250, 0.25);
}
\.menu i { font-size:.95rem; color:#ffffff; }
.menu .pill .pill-text { font-size: .95rem; }
.menu li.active i { color:#ffffff; }

/* Center items when sidebar is collapsed */
.sidebar.collapsed .menu { align-items: center; }
.sidebar.collapsed .menu .pill { justify-content: center; padding-left: 0; padding-right: 0; width: 100%; }

/* Move menu options slightly up in expanded mode */
.sidebar:not(.collapsed) .menu { justify-content: flex-start; margin-top: 50px; }

.sidebar-footer { padding:8px 12px; border-top: 1px solid rgba(255,255,255,0.15); }

/* Logout button themed to sidebar */
:deep(.sidebar-footer .p-button) {
  width: 100%;
  justify-content: flex-start;
  color: #e6ecff !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}
:deep(.sidebar-footer .p-button:hover) {
  background: linear-gradient(135deg, rgba(30,109,255,0.28) 0%, rgba(255,122,24,0.22) 100%);
  box-shadow: 0 6px 16px rgba(30,109,255,0.25);
}

  .main-content {
    flex-grow: 1;
    padding: 1rem; /* margen alrededor del contenedor principal */
    transition: margin-left 0.3s ease;
    overflow-y: auto;
    width: calc(100% - 264px); /* 240px sidebar + 24px separación */
    background: #ffffff;
  }

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
    left: 0;
    transform: translateX(0);
    margin-left: 0; /* sin separación en móvil */
}


  .sidebar.collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    width: 100%;
    padding: 1rem;
    margin-left: 0;
  }
}

/* Light variant overrides to match provided mock */
.sidebar.sidebar--light { 
  color: #1f2937;
  background: #ffffff;
  border-right: none; /* remove divider line */
  box-shadow: none;
}
.sidebar.sidebar--light .brand { width: 64px; height: auto; cursor: pointer; display:block; margin: 0 auto; }
.sidebar.sidebar--light .logo { color: #111827; }
.sidebar.sidebar--light .toggle-btn { color: #f7b500; }
.sidebar.sidebar--light .menu .pill { color: #6b7280; padding: 10px 12px; border-radius: 14px; }
/* Default icon box + icon color */
.sidebar.sidebar--light .menu .pill .icon-hold {
  background: #f2f5fb;
}
.sidebar.sidebar--light .menu .pill i { color: #8b8b8b; font-size: 1rem; }
.sidebar.sidebar--light .menu .pill .pill-text { color: #6b7280; }
/* Hover: subtle row highlight */
.sidebar.sidebar--light .menu li .pill:hover { background: #f7faff; }
/* Active: blue bubble only behind icon and blue label */
.sidebar.sidebar--light .menu li.active .pill { background: transparent; color: inherit; box-shadow: none; }
.sidebar.sidebar--light .menu li.active .pill .icon-hold {
  background: linear-gradient(180deg, #37a3ff 0%, #0597ff 100%);
  box-shadow: 0 8px 16px rgba(5,151,255,.25);
}
.sidebar.sidebar--light .menu li.active .pill i { color: #ffffff; }
.sidebar.sidebar--light .menu li.active .pill .pill-text { color: #0597ff; font-weight: 600; }
.sidebar.sidebar--light .sidebar-footer { border-top: 1px solid #eef0f3; }
:deep(.sidebar.sidebar--light .sidebar-footer) { display: none; }
:deep(.sidebar.sidebar--light .sidebar-footer .p-button) {
  width: 100%;
  justify-content: flex-start;
  color: #6b7280 !important;
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
:deep(.sidebar.sidebar--light .sidebar-footer .p-button:hover) {
  background: #f3f7ff;
}

/* Ensure toggle button is visible when collapsed */
.sidebar.sidebar--light .sidebar-header { position: relative; min-height: 60px; padding: 88px 16px 10px; justify-content: center; align-items: center; }
.sidebar.sidebar--light .brand { width: 64px; height: auto; display:block; margin: 0 auto; }
.sidebar.collapsed.sidebar--light .brand { width: 36px; }
.sidebar.sidebar--light :deep(.toggle-btn.p-button) {
  position: absolute;
  right: 12px;
  top: 16px;
  transform: none;
  padding: 0;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  color: #f7b500;
}
.sidebar.sidebar--light :deep(.toggle-btn .p-button-icon) { color: #f7b500; font-size: 1.1rem; }

/* Bottom area styles */
.bottom-area { margin-top: auto; margin-bottom: 16px; padding: 24px 16px 20px; display: flex; flex-direction: column; gap: 20px; }
.settings-row { display: flex; align-items: center; justify-content: flex-start; gap: 12px; color: #6b7280; cursor: pointer; }
.settings-row .gear-bg { width: 24px; height: 24px; border-radius: 50%; background: #ffe8b3; display: inline-flex; align-items: center; justify-content: center; }
.settings-row .gear-bg i { color: #f7b500; font-size: .8rem; }
.settings-row .settings-text { font-size: .95rem; letter-spacing: 0.15px; }

.user-card { display: flex; align-items: center; gap: 14px; width: 100%; background: #ffffff; border: 1px solid #eef2f7; border-radius: 10px; padding: 12px 16px; box-shadow: 0 4px 4px rgba(106,154,172,0.25); overflow: hidden; }
.user-card .avatar { width: 36px; height: 36px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.user-card .info .name { font-weight: 600; color: #111827; font-size: 1.05rem; }
.user-card .info .email { font-size: 0.85rem; color: #6b7280; }
.user-card .crown { color: #f7b500; font-size: 0.85rem; margin-left: 6px; }
.user-card .logout-icon { margin-left: auto; margin-right: 0; background: transparent; border: none; color: #ef4444; font-size: 1rem; cursor: pointer; padding: 6px; display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; }
.user-card .logout-icon:hover { filter: brightness(0.95); }

.bottom-collapsed { margin-top: auto; padding: 8px; display: flex; flex-direction: column; gap: 10px; align-items: center; }
.bottom-collapsed :deep(.icon-btn.p-button) { width: 36px; height: 36px; }
.bottom-collapsed :deep(.icon-btn.danger .p-button-icon) { color: #ef4444; }
</style>








