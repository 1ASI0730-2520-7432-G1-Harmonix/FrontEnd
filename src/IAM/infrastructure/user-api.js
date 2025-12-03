import httpInstance from "@/shared/services/http.instance.js";

const resourceEndpoint = import.meta.env.VITE_USERS_ENDPOINT_PATH;

const authenticationEndpoint = import.meta.env.VITE_AUTHENTICATION_ENDPOINT_PATH;

export const UserApi={
    async create(dto) {
        const res = await httpInstance.post(`${authenticationEndpoint}/sing-up`, dto);
        return res.data;
    },

    async signIn(userData){
        const { data } = await httpInstance.post(`${authenticationEndpoint}/sign-in`, userData);
        const arr = data;
        return Array.isArray(arr) ? arr[0] : arr;
    },

    async getById(id, token) {
        const res = await httpInstance.get(`${resourceEndpoint}/user/user/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const arr = res.data || {};
        return Array.isArray(arr) ? arr[0] : arr;
    },

    async getByEmail(email, token) {
        const res = await httpInstance.get(`${resourceEndpoint}/user/byEmail/${email}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
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