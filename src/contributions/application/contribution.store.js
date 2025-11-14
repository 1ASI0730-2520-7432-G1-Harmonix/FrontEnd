import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MemberContributionService } from '@/contributions/infrastructure/contributions-service.js'

export const useContributionStore = defineStore('member-contributions', () => {
  const items = ref([]) // last loaded collection
  const loading = ref(false)
  const errors = ref([])

  const normalizeError = (err) => err?.message || String(err)

  async function loadByMemberId(memberId) {
    items.value = []
    errors.value = []
    loading.value = true
    try {
      items.value = await MemberContributionService.listByMemberId(memberId)
      return items.value
    } catch (e) {
      errors.value.push(normalizeError(e))
      items.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function loadByBillId(billId) {
    items.value = []
    errors.value = []
    loading.value = true
    try {
      items.value = await MemberContributionService.listByBillId(billId)
      return items.value
    } catch (e) {
      errors.value.push(normalizeError(e))
      items.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    errors.value = []
    loading.value = true
    try {
      const created = await MemberContributionService.createContribution(data)
      items.value = [created, ...items.value]
      return created
    } catch (e) {
      errors.value.push(normalizeError(e))
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id, data) {
    errors.value = []
    loading.value = true
    try {
      const updated = await MemberContributionService.updateContribution(id, data)
      items.value = items.value.map((x) => (x.id === id ? updated : x))
      return updated
    } catch (e) {
      errors.value.push(normalizeError(e))
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    errors.value = []
    loading.value = true
    try {
      await MemberContributionService.deleteContribution(id)
      items.value = items.value.filter((x) => x.id !== id)
    } catch (e) {
      errors.value.push(normalizeError(e))
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    loading,
    errors,
    loadByMemberId,
    loadByBillId,
    create,
    update,
    remove,
  }
})

