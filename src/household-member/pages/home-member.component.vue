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
          <i :class="item.icon"></i>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
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
  width: 250px;
  background-color: #2c3e50;
  color: white;
  transition: width 0.3s ease;
  position: fixed;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
}

.toggle-btn {
  color: white;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
}

.user-profile h4 {
  margin: 0;
  font-size: 1rem;
}

.user-profile p {
  margin: 0;
  font-size: 0.85rem;
  color: #ccc;
}

.menu {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  flex-grow: 1;
}

.menu li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu li.active {
  background-color: rgba(255, 255, 255, 0.25);
}

.menu i {
  font-size: 1.2rem;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 60px;
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
    padding: 1.5rem;
  }
}
</style>
