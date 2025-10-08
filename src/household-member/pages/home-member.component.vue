<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import httpInstance from '@/shared/services/http.instance';
import Button from 'primevue/button';

const router = useRouter();
const user = ref(null);
const representative = ref(null);
const sidebarCollapsed = ref(false);

const menuItems = [
  { label: 'Inicio', icon: 'pi pi-home', route: '/dashboard/member' },
  { label: 'Mis aportes', icon: 'pi pi-check-square', route: '/dashboard/member/contributions' },
  { label: 'Estado del hogar', icon: 'pi pi-file', route: '/dashboard/member/household-status' },
  { label: 'Buscar hogar', icon: 'pi pi-search', route: '/dashboard/member/search' },
  { label: 'Configuración', icon: 'pi pi-cog', route: '/dashboard/member/settings' }
];

onMounted(async () => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
    await loadHouseholdInfo();
  }
});

async function loadHouseholdInfo() {
  try {
    const response = await httpInstance.get(`/users?householdId=${user.value.householdId}&role=representative`);
    if (response.data.length > 0) {
      representative.value = response.data[0];
    }
  } catch (error) {
    console.error('Error loading household information:', error);
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
</script>

<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
      <div class="sidebar-header">
        <div class="logo" @click="navigateTo('/dashboard/member')">
          <i class="pi pi-home"></i>
          <span v-if="!sidebarCollapsed">Mi Hogar</span>
        </div>
        <Button icon="pi pi-bars" text @click="toggleSidebar" class="toggle-btn" />
      </div>

      <div class="user-profile" v-if="user">
        <img src="https://ui-avatars.com/api/?name=Miembro&background=0D8ABC&color=fff" alt="avatar" />
        <div v-if="!sidebarCollapsed">
          <h4>{{ user.name }}</h4>
          <p>{{ user.email }}</p>
        </div>
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

      <div class="sidebar-footer">
        <Button
          v-if="!sidebarCollapsed"
          icon="pi pi-sign-out"
          label="Cerrar sesión"
          text
          class="logout-btn"
          @click="logout"
        />
        <Button v-else icon="pi pi-sign-out" text rounded @click="logout" />
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="['main-content', { 'sidebar-collapsed': sidebarCollapsed }]">
      <div class="content-wrapper">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background: var(--surface-ground, #f8f9fa);
}

/* SIDEBAR */
.sidebar {
  position: sticky;
  top: 0;
  width: 280px;
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
  border-radius: 0 18px 18px 0; /* flush left side */
  margin: 0; /* stick to the left edge */
  padding-bottom: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18);
  transition: width 0.3s ease, background 0.3s ease;
}

.sidebar.collapsed {
  width: 92px;
}

.sidebar-header {
  display:flex;
  align-items:center;
  justify-content:space-between; padding:12px 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 700;
  color: #f5f7ff;
  font-size: 1.1rem;
}

.toggle-btn {
  color: #f5f7ff;
}

.user-profile { display:flex; align-items:center;
  gap:1rem; padding:10px 16px; }
.user-profile img { width:46px; height:46px; border-radius:50%;
  object-fit:cover; box-shadow:0 4px 12px rgba(0,0,0,0.25); }
.user-profile h4 { margin:0; font-size:1rem; }
.user-profile p { margin:0; font-size:.85rem; color:#d6def8; opacity:.85; }

.menu { list-style:none; padding:8px; margin:6px 0; flex-grow:1; display:flex; flex-direction:column; gap:8px; }
.menu li { cursor:pointer; }
.menu .pill {
  display:flex; align-items:center; gap:12px;
  padding:10px 14px; border-radius:12px; transition:all .2s ease;
  color:#e6ecff;
}
.menu li .pill:hover { background: rgba(255,255,255,0.14); transform: translateY(-1px); }
.menu li.active .pill {
  /* Brand gradient based on HarMoniX palette (blue → orange) */
  background: #001b2e;
  color:#f3f3f3;
  box-shadow: 0 8px 20px rgba(166, 195, 250, 0.25);
}
.menu i { font-size:1.15rem; color:#ffffff; }
.menu li.active i { color:#ffffff; }

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
  padding: 1rem;
  transition: margin-left 0.3s ease;
  overflow-y: auto;
  width: calc(100% - 280px);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
    left: 0;
    transform: translateX(0);
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
</style>
