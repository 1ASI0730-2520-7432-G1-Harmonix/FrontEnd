import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_SETTINGS_ENDPOINT_PATH;

export const SettingsApi ={



    async getAll(){
        const res = await httpInstance.get(this.resourceEndpoint);
        return res.data;
    },

    async getById(id){
        const res = await httpInstance.get(`${this.resourceEndpoint}/${id}`);
        const arr = res.data || {};
        return Array.isArray(arr) ? arr[0] : [...arr];
        },

    async getByUserId(userId){
        const res = await httpInstance.get(`${this.resourceEndpoint}/?userId=${userId}`);
        const arr = res.data || {};
        return Array.isArray(arr) ? arr[0] : [...arr];
    },

    async create(resource){
        const res = await httpInstance.post(this.resourceEndpoint, resource);
        return res.data;
    },

    async update(id, resource){
        const res = await httpInstance.put(`${this.resourceEndpoint}/${id}`, resource);
        return res.data;
    },

    async remove(id){
        await httpInstance.delete(`${this.resourceEndpoint}/${id}`);
    }
}