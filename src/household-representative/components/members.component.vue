<script setup lang="js">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import Card from "primevue/card";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Toolbar from "primevue/toolbar";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";

import { HouseholdMemberService } from "@/household-member/services/household-member.service.js";

const { t } = useI18n();
const route = useRoute();
const confirm = useConfirm();

const householdId = ref(route.query.householdId || route.params.householdId || "");
const loading = ref(false);
const error = ref("");
const success = ref("");

const members = ref([]);

// Dialog state
const showDialog = ref(false);
const dialogMode = ref("create"); // 'create' | 'edit'

const blankForm = {
  id: "",
  userId: 0,
  householdId: "",
  joinedAt: new Date().toISOString(),
  createdAt: "",
  updatedAt: "",
};
const form = ref({ ...blankForm });

const isEdit = computed(() => dialogMode.value === "edit");

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

async function load() {
  const userData = localStorage.getItem("user");
  const householdIdAux = JSON.parse(userData).householdId;

  console.log('HouseHold: ',householdIdAux);
  if (!householdIdAux) {
    error.value = "No householdId provided.";
    return;
  }
  loading.value = true;
  error.value = "";
  success.value = "";
  try {
    const list = await HouseholdMemberService.listByHouseholdId(householdIdAux);
    console.log('List:',list);
    members.value = list;
    console.log('Members:',members.value);
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load household members.";
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  dialogMode.value = "create";
  form.value = {
    ...blankForm,
    householdId: householdId.value,
    joinedAt: new Date().toISOString(),
  };
  showDialog.value = true;
}

function openEdit(row) {
  dialogMode.value = "edit";
  form.value = { ...row };
  showDialog.value = true;
}

async function save() {
  error.value = "";
  success.value = "";
  try {
    if (isEdit.value && form.value.id) {
      const updated = await HouseholdMemberService.updateMember(form.value.id, {
        ...form.value,
        userId: Number(form.value.userId || 0),
      });
      // replace in local list
      members.value = members.value.map(m => (m.id === updated.id ? updated : m));
      success.value = "Member updated.";
    } else {
      const created = await HouseholdMemberService.createMember({
        ...form.value,
        userId: Number(form.value.userId || 0),
      });
      members.value = [created, ...members.value];
      success.value = "Member added.";
    }
    showDialog.value = false;
  } catch (e) {
    console.error(e);
    const msg = typeof e === "object" && !Array.isArray(e) ? (e.message || "") : "";
    // If it’s a validation errors object, show a generic message and log full detail
    error.value = msg || "Could not save member. Check fields and try again.";
  }
}

function confirmDelete(row) {
  confirm.require({
    message: `Delete member ${row.id}?`,
    header: "Confirm",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await HouseholdMemberService.deleteMember(row.id);
        members.value = members.value.filter(m => m.id !== row.id);
        success.value = "Member deleted.";
      } catch (e) {
        console.error(e);
        error.value = e?.message || "Failed to delete member.";
      }
    },
  });
}

onMounted(load);
</script>

<template>
  <div class="members-home">
    <div class="welcome-card border-round mb-3" >
      <div class="flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 class="title m-0">Household Members</h2>
          <!--          <Tag severity="info" :value="householdId.value || '—'" />-->
        </div>
        <div class="flex align-items-center gap-2">
          <Button label="Add member" icon="pi pi-plus" @click="openCreate" />
        </div>
      </div>
    </div>

    <Card >
      <template #content>
        <DataTable
            :value="members"
            dataKey="id"
            :loading="loading"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
          <Column field="id" header="ID" sortable />
          <Column field="userId" header="User ID" sortable />
          <Column field="householdId" header="Household ID" sortable />
          <Column header="Joined At" sortable>
            <template #body="{ data }">
              <span>{{ formatDate(data.joinedAt) }}</span>
            </template>
          </Column>

          <Column header="Created" sortable>
            <template #body="{ data }">
              <span>{{ formatDate(data.createdAt) }}</span>
            </template>
          </Column>

          <Column header="Updated" sortable>
            <template #body="{ data }">
              <span>{{ formatDate(data.updatedAt) }}</span>
            </template>
          </Column>
          <Column header="Actions" :exportable="false">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button label="Edit" size="small" outlined @click="openEdit(data)" />
                <Button label="Delete" size="small" severity="danger" outlined @click="confirmDelete(data)" />
              </div>
            </template>
          </Column>
        </DataTable>

        <div class="mt-3">
          <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
        </div>
      </template>
    </Card>

    <Dialog v-model:visible="showDialog" modal :header="isEdit ? 'Edit Member' : 'Add Member'" :style="{ width: '450px' }">
      <div class="field mb-3">
        <label class="block mb-2">User ID</label>
        <InputText v-model.number="form.userId" placeholder="e.g., 1759798502697" />
      </div>

      <div class="field mb-3">
        <label class="block mb-2">Household ID</label>
        <InputText v-model="form.householdId" placeholder="e.g., HOG-1759796571919" />
      </div>

      <div class="field mb-3">
        <label class="block mb-2">Joined At</label>
        <!-- Calendar returns Date; store as ISO -->
        <Calendar
            v-model="form.joinedAt"
            showIcon
            :manualInput="true"
            :pt="{ input: { class: 'w-full' } }"
            @update:modelValue="val => (form.joinedAt = typeof val === 'string' ? val : new Date(val).toISOString())"
        />
        <small class="text-600">Current: {{ typeof form.joinedAt === 'string' ? form.joinedAt : '' }}</small>
      </div>

      <div class="flex justify-content-end gap-2 mt-4">
        <Button label="Cancel" severity="secondary" outlined @click="showDialog = false" />
        <Button :label="isEdit ? 'Save' : 'Create'" @click="save" />
      </div>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<style scoped>
.welcome-card .title { font-size: 1.75rem; font-weight: 800; color: #0f172a; }
.welcome-card .subtitle { color: #6b7280; }
.members-home {
  animation: fadeIn 0.5s ease-in-out;
  padding: 1rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.welcome-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  padding: 1.25rem 1.5rem;
}
</style>
