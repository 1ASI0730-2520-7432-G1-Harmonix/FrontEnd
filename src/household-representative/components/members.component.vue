<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import memberPipeline from '../services/member-assembler.service.js';
import { MemberFilters } from '../models/member.model.js';
import MembersTable from './members-table.vue';
import MembersSearchBar from './members-search-bar.vue';
import MemberDetailsModal from './member-details-modal.vue';

const router = useRouter();

// Reactive data
const members = ref([]);
const loading = ref(false);
const error = ref('');
const filters = ref(new MemberFilters());
const showAddMemberDialog = ref(false);
const showMemberDetailsDialog = ref(false);
const selectedMember = ref(null);

// Computed properties
const filteredMembers = computed(() => {
  return members.value;
});

// Methods
onMounted(async () => {
  await loadMembers();
});

async function loadMembers() {
  loading.value = true;
  error.value = '';
  
  try {
    members.value = await memberPipeline.processMemberData(filters.value);
  } catch (err) {
    error.value = 'Error loading household members';
    console.error('Error loading members:', err);
  } finally {
    loading.value = false;
  }
}

async function handleSearch() {
  await loadMembers();
}

async function handleClearFilters() {
  filters.value.clear();
  await loadMembers();
}

function handleViewMember(member) {
  selectedMember.value = member;
  showMemberDetailsDialog.value = true;
}

function addNewMember() {
  showAddMemberDialog.value = true;
}

async function handleUpdateSearchTerm(value) {
  filters.value.searchTerm = value;
  await loadMembers();
}

async function handleUpdateStatusFilter(value) {
  filters.value.statusFilter = value;
  await loadMembers();
}

async function handleUpdateRoleFilter(value) {
  filters.value.roleFilter = value;
  await loadMembers();
}
</script>

<template>
  <div class="members-container">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Miembros del hogar</h1>
      
      <!-- Search and Filter Bar -->
      <MembersSearchBar
        :search-term="filters.searchTerm"
        :status-filter="filters.statusFilter"
        :role-filter="filters.roleFilter"
        @update:search-term="handleUpdateSearchTerm"
        @update:status-filter="handleUpdateStatusFilter"
        @update:role-filter="handleUpdateRoleFilter"
        @search="handleSearch"
        @clear-filters="handleClearFilters"
      />
    </div>

    <!-- Error Message -->
    <pv-message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </pv-message>

    <!-- Members Table -->
    <pv-card class="members-card">
      <template #content>
        <MembersTable
          :members="filteredMembers"
          :loading="loading"
          @view-member="handleViewMember"
        />
      </template>
    </pv-card>

    <!-- Add Member Button -->
    <div class="add-member-section">
      <pv-button 
        icon="pi pi-plus" 
        label="Añadir nuevo miembro"
        class="add-member-button"
        @click="addNewMember"
      />
    </div>

    <!-- Member Details Modal -->
    <MemberDetailsModal
      v-model:visible="showMemberDetailsDialog"
      :member="selectedMember"
    />

    <!-- Add Member Dialog -->
    <pv-dialog 
      v-model:visible="showAddMemberDialog" 
      header="Añadir nuevo miembro"
      :modal="true" 
      :style="{ width: '40vw' }"
    >
      <div class="add-member-form">
        <p>Funcionalidad de añadir miembro en desarrollo...</p>
        <pv-button label="Cerrar" @click="showAddMemberDialog = false" />
      </div>
    </pv-dialog>
  </div>
</template>

<style scoped>
.members-container {
  padding: 2rem;
  background-color: #000;
  min-height: 100vh;
  color: white;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1.5rem;
}

.members-card {
  background-color: #1a1a1a;
  border: 1px solid #333;
}

.add-member-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.add-member-button {
  background-color: #2c3e50;
  border-color: #2c3e50;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
}

.add-member-form {
  padding: 1rem 0;
}

/* PrimeVue overrides for dark theme */
:deep(.p-card) {
  background-color: #1a1a1a;
  color: white;
}

:deep(.p-dialog) {
  background-color: #1a1a1a;
  color: white;
}

:deep(.p-dialog-header) {
  background-color: #2c3e50;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .members-container {
    padding: 1rem;
  }
}
</style>