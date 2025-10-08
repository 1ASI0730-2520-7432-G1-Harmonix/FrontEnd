<script setup>
import { computed } from 'vue';
import { Member } from '../models/member.model.js';

// Props
const props = defineProps({
  members: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['view-member']);

// Computed
const memberInstances = computed(() => {
  return props.members.map(memberData => new Member(memberData));
});

// Methods
function handleViewMember(member) {
  emit('view-member', member);
}
</script>

<template>
  <pv-datatable 
    :value="memberInstances" 
    :loading="loading"
    paginator 
    :rows="10"
    :rows-per-page-options="[5, 10, 20]"
    class="members-table"
    :empty-message="'No se encontraron miembros'"
  >
    <pv-column field="name" header="Nombre" sortable>
      <template #body="{ data }">
        <div class="member-name">
          <img 
            :src="`https://ui-avatars.com/api/?name=${data.name}&background=0D8ABC&color=fff`" 
            :alt="data.name"
            class="member-avatar"
          />
          <span>{{ data.name }}</span>
        </div>
      </template>
    </pv-column>
    
    <pv-column field="status" header="Estado" sortable>
      <template #body="{ data }">
        <pv-tag 
          :value="data.getStatusLabel()" 
          :severity="data.getStatusSeverity()"
        />
      </template>
    </pv-column>
    
    <pv-column field="role" header="Rol" sortable>
      <template #body="{ data }">
        <span class="role-text">{{ data.getRoleLabel() }}</span>
      </template>
    </pv-column>
    
    <pv-column field="totalContributed" header="Total aportado" sortable>
      <template #body="{ data }">
        <span class="amount-text">{{ data.getFormattedTotalContributed() }}</span>
      </template>
    </pv-column>
    
    <pv-column header="Acciones" :exportable="false">
      <template #body="{ data }">
        <pv-button 
          icon="pi pi-eye" 
          label="Ver" 
          severity="success"
          size="small"
          @click="handleViewMember(data)"
        />
      </template>
    </pv-column>
  </pv-datatable>
</template>

<style scoped>
.members-table {
  background-color: transparent;
}

.member-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.role-text {
  color: #ccc;
}

.amount-text {
  color: #4CAF50;
  font-weight: bold;
}

/* PrimeVue overrides for dark theme */
:deep(.p-datatable) {
  background-color: transparent;
}

:deep(.p-datatable-header) {
  background-color: #0D8ABC;
  color: white;
}

:deep(.p-datatable-tbody > tr) {
  background-color: #1a1a1a;
  color: white;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #2a2a2a;
}

:deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #222;
}

:deep(.p-datatable-tbody > tr:nth-child(even):hover) {
  background-color: #333;
}
</style>