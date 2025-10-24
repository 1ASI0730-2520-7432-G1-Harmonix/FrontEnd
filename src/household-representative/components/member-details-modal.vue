<script setup>
import { computed } from 'vue';
import { Member } from '../models/member.model.js';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  member: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:visible']);

// Computed
const memberInstance = computed(() => {
  return props.member ? new Member(props.member) : null;
});

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const dialogTitle = computed(() => {
  return memberInstance.value ? `Detalles de ${memberInstance.value.name}` : 'Detalles del miembro';
});
</script>

<template>
  <pv-dialog 
    v-model:visible="dialogVisible" 
    :header="dialogTitle"
    :modal="true" 
    :style="{ width: '50vw' }"
  >
    <div v-if="memberInstance" class="member-details">
      <div class="detail-row">
        <label>Nombre:</label>
        <span>{{ memberInstance.name }}</span>
      </div>
      <div class="detail-row">
        <label>Email:</label>
        <span>{{ memberInstance.email }}</span>
      </div>
      <div class="detail-row">
        <label>Estado:</label>
        <pv-tag 
          :value="memberInstance.getStatusLabel()" 
          :severity="memberInstance.getStatusSeverity()"
        />
      </div>
      <div class="detail-row">
        <label>Rol:</label>
        <span>{{ memberInstance.getRoleLabel() }}</span>
      </div>
      <div class="detail-row">
        <label>Total aportado:</label>
        <span class="amount-highlight">{{ memberInstance.getFormattedTotalContributed() }}</span>
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.member-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

.detail-row label {
  font-weight: bold;
  color: #ccc;
}

.amount-highlight {
  color: #4CAF50;
  font-weight: bold;
  font-size: 1.1rem;
}

/* PrimeVue overrides for dark theme */
:deep(.p-dialog) {
  background-color: #1a1a1a;
  color: white;
}

:deep(.p-dialog-header) {
  background-color: #2c3e50;
  color: white;
}
</style>