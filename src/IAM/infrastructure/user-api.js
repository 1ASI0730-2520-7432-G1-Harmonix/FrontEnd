import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_USERS_ENDPOINT_PATH;
export const UserApi={
    async create(dto) {
        const res = await httpInstance.post(`${resourceEndpoint}`, dto);
        return res.data;
    },

    async getById(id) {
        const res = await httpInstance.get(`${resourceEndpoint}/${id}`);
        const arr = res.data || {};
        return Array.isArray(arr) ? arr[0] : arr;
    },

    async getByEmail(email) {
        const res = await httpInstance.get(`${resourceEndpoint}/?email=${email}`);
        const arr = res.data || {};
        return Array.isArray(arr) ? arr[0] : arr;
    },

    async update(id, dto) {
        const res = await httpInstance.put(`${resourceEndpoint}/${id}`, dto);
        return res.data;
    },

    async remove(id) {
        await httpInstance.delete(`${resourceEndpoint}/${id}`);
    }


}