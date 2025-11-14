import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_HOUSEHOLD_MEMBER_PATH;

export const HouseholdMemberApi = {
    resourceEndpoint,

    async getAll() {
        const { data } = await httpInstance.get(resourceEndpoint);
        return data;
    },

    async getById(id) {
        const { data } = await httpInstance.get(`${resourceEndpoint}/${id}`);
        return data ?? null;
    },


    async getByRepresentativeId(representativeId) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?representativeId=${encodeURIComponent(representativeId)}`);
        return Array.isArray(data) ? data : (data ?? []);
    },

    // GET /householdMembers?householdId=HOG-xxx → array
    async getByHouseholdId(householdId) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?householdId=${encodeURIComponent(householdId)}`);
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
