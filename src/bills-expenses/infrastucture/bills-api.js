import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_BILLS_PATH;

export const BillApi = {
    resourceEndpoint,

    async getAll() {
        const { data } = await httpInstance.get(resourceEndpoint);
        return data;
    },

    async getById(id) {
        const { data } = await httpInstance.get(`${resourceEndpoint}/${id}`);
        return data ?? null;
    },

    async listByHouseholdId(householdId) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?householdId=${encodeURIComponent(householdId)}`);
        return Array.isArray(data) ? data : (data ?? []);
    },

    async listByCreator(createdBy) {
        const { data } = await httpInstance.get(`${resourceEndpoint}?createdBy=${encodeURIComponent(createdBy)}`);
        return Array.isArray(data) ? data : (data ?? []);
    },

    async create(resource) {
        const { data } = await httpInstance.post(resourceEndpoint, resource);
        return data;
    },

    // Some backends ignore provided id on POST. This helper
    // attempts to create the resource with a specific id using PUT.
    async createWithId(resource) {
        if (!resource?.id) throw new Error("id is required to create with specific id");
        const { data } = await httpInstance.put(`${resourceEndpoint}/${encodeURIComponent(resource.id)}`, resource);
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
