import http from "@/shared/services/http.instance.js";

const resourceEndpoint = "/member_contribution";

export const MemberContributionApi = {
  resourceEndpoint,

  async getAll() {
    const { data } = await http.get(resourceEndpoint);
    return data;
  },

  async getById(id) {
    const { data } = await http.get(`${resourceEndpoint}/${id}`);
    return data ?? null;
  },

  async listByMemberId(memberId) {
    const { data } = await http.get(`${resourceEndpoint}?memberId=${encodeURIComponent(memberId)}`);
    return Array.isArray(data) ? data : (data ?? []);
  },

  async listByBillId(billId) {
    const { data } = await http.get(`${resourceEndpoint}?billId=${encodeURIComponent(billId)}`);
    return Array.isArray(data) ? data : (data ?? []);
  },

  async create(resource) {
    const { data } = await http.post(resourceEndpoint, resource);
    return data;
  },

  async update(id, resource) {
    const { data } = await http.put(`${resourceEndpoint}/${id}`, resource);
    return data;
  },

  async remove(id) {
    await http.delete(`${resourceEndpoint}/${id}`);
  },
};
