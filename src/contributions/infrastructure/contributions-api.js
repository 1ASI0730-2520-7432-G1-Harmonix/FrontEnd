import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_MEMBER_CONTRIBUTIONS_PATH;

export const MemberContributionApi = {
    resourceEndpoint,

    async getAll() {
        const { data } = await httpInstance.get(resourceEndpoint);
        return data;
    },

    async getById(id) {
        const { data } = await httpInstance.get(`${resourceEndpoint}/${id}`);
        return data ?? null;
    },

    async listByMemberId(memberId) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?memberId=${encodeURIComponent(memberId)}`);
        return Array.isArray(data) ? data : (data ?? []);
    },

    async listByBillId(billId) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?billId=${encodeURIComponent(billId)}`);
        return Array.isArray(data) ? data : (data ?? []);
    },

    async create(resource) {
        const { data } = await httpInstance.post(resourceEndpoint, resource);
        return data;
    },

    async update(id, resource) {
        const { data } = await httpInstance.put(`${resourceEndpoint}/${id}`, resource);
        return data;
    },

    async remove(id) {
        await httpInstance.delete(`${resourceEndpoint}/${id}`);
    },
};
