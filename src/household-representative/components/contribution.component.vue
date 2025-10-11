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
import InputNumber from "primevue/inputnumber";
import Calendar from "primevue/calendar";
import Tag from "primevue/tag";
import Message from "primevue/message";
import Toolbar from "primevue/toolbar";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";

import { MemberContributionService } from "@/contributions/infrastructure/contributions-service.js";
import {BillService} from "@/bills-expenses/infrastucture/bills.service.js";

const { t } = useI18n();
const route = useRoute();
const confirm = useConfirm();

const contributionId = ref(route.query.contributionId || route.params.contributionId || "");
const loading = ref(false);
const error = ref("");
const success = ref("");
const contributions = ref([]);

const showDialog = ref(false);
const dialogMode = ref("create"); // 'create' | 'edit'

const blankForm = {
  id: "",
  contributionId: "",
  memberId: "",
  amount: 0,
  status: 0,
  payedAt: new Date().toISOString(),
  createdAt: "",
  updatedAt: "",
};
const form = ref({ ...blankForm });
const isEdit = computed(() => dialogMode.value === "edit");

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso;
  }
}
function formatMoney(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "PEN" }).format(num);
}
function formatStatus(s) {
  return s === 1 ? "Paid" : "Pending";
}

async function load() {
  const user = localStorage.getItem("user");
  const HouseHoldIdAux = JSON.parse(user).householdId;
  const BillsPerActiveUser = BillService.listByHouseholdId(HouseHoldIdAux);

  if (!contributionId.value) {
    error.value = "No contributionId provided.";
    return;
  }
  loading.value = true;
  error.value = "";
  success.value = "";
  try {
    const list = await MemberContributionService.listByContributionId(contributionId.value);
    contributions.value = list;
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load member contributions.";
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  dialogMode.value = "create";
  form.value = {
    ...blankForm,
    contributionId: contributionId.value,
    payedAt: new Date().toISOString(),
  };
  showDialog.value = true;
}

function openEdit(row) {
  dialogMode.value = "edit";
  form.value = { ...row, amount: Number(row.amount || 0) };
  showDialog.value = true;
}

async function save() {
  error.value = "";
  success.value = "";
  try {
    const payload = {
      ...form.value,
      amount: Number(form.value.amount || 0),
      status: Number(form.value.status || 0),
    };

    if (isEdit.value && form.value.id) {
      const updated = await MemberContributionService.updateContribution(form.value.id, payload);
      contributions.value = contributions.value.map((c) => (c.id === updated.id ? updated : c));
      success.value = "Contribution updated.";
    } else {
      const created = await MemberContributionService.createContribution(payload);
      contributions.value = [created, ...contributions.value];
      success.value = "Contribution added.";
    }
    showDialog.value = false;
  } catch (e) {
    console.error(e);
    error.value = typeof e?.message === "string" ? e.message : "Could not save contribution.";
  }
}

function confirmDelete(row) {
  confirm.require({
    message: `Delete contribution ${row.id}?`,
    header: "Confirm",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Delete",
    rejectLabel: "Cancel",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        await MemberContributionService.deleteContribution(row.id);
        contributions.value = contributions.value.filter((c) => c.id !== row.id);
        success.value = "Contribution deleted.";
      } catch (e) {
        console.error(e);
        error.value = e?.message || "Failed to delete contribution.";
      }
    },
  });
}

onMounted(load);
</script>

<template>
  <div class="contrib-home">
    <Toolbar class="mb-3">
      <template #start>
        <div class="flex align-items-center gap-2">
          <h2 class="m-0">Member Contributions</h2>
          <Tag severity="info" :value="contributionId || '—'" />
        </div>
      </template>
      <template #end>
        <Button label="Add contribution" icon="pi pi-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <Card>
      <template #content>
        <DataTable
            :value="contributions"
            dataKey="id"
            :loading="loading"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
          <Column field="id" header="ID" sortable />
          <Column field="memberId" header="Member ID" sortable />
          <Column header="Amount" :body="row => formatMoney(row.amount)" sortable />
          <Column header="Status" :body="row => formatStatus(row.status)" sortable />
          <Column header="Payed At" :body="row => formatDate(row.payedAt)" sortable />
          <Column header="Created" :body="row => formatDate(row.createdAt)" />
          <Column header="Updated" :body="row => formatDate(row.updatedAt)" />
          <Column header="Actions">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                    label="Edit"
                    size="small"
                    outlined
                    @click="openEdit(data)"
                />
                <Button
                    label="Delete"
                    size="small"
                    severity="danger"
                    outlined
                    @click="confirmDelete(data)"
                />
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

    <Dialog v-model:visible="showDialog" modal :header="isEdit ? 'Edit Contribution' : 'Add Contribution'" :style="{ width: '520px' }">
      <div class="field mb-3">
        <label class="block mb-2">Member ID</label>
        <InputText v-model="form.memberId" placeholder="e.g., HM-123393" />
      </div>

      <div class="field mb-3">
        <label class="block mb-2">Amount</label>
        <InputNumber
            v-model="form.amount"
            mode="currency"
            currency="PEN"
            :min="0"
            :step="1"
            :useGrouping="true"
        />
      </div>

      <div class="field mb-3">
        <label class="block mb-2">Status</label>
        <InputNumber v-model="form.status" :min="0" :max="1" />
        <small>0 = Pending, 1 = Paid</small>
      </div>

      <div class="field mb-3">
        <label class="block mb-2">Payed At</label>
        <Calendar
            v-model="form.payedAt"
            showIcon
            :manualInput="true"
            :pt="{ input: { class: 'w-full' } }"
            @update:modelValue="val => (form.payedAt = typeof val === 'string' ? val : new Date(val).toISOString())"
        />
        <small class="text-600">Current: {{ typeof form.payedAt === 'string' ? form.payedAt : '' }}</small>
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
.contrib-home {
  animation: fadeIn 0.5s ease-in-out;
  padding: 1rem;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
