import http from '@/shared/services/http.instance';

export const HouseholdApi = {
  async create(dto) {
    const res = await http.post('/households', dto);
    return res.data;
  },

  async listByRepresentative(representativeId) {
    const res = await http.get(`/households?representativeId=${representativeId}`);
    return res.data;
  },

  async getById(id) {
    const res = await http.get(`/households?id=${id}`);
    const arr = res.data || [];
    return Array.isArray(arr) ? arr[0] : arr;
  },

  async update(id, dto) {
    const res = await http.put(`/households/${id}`, dto);
    return res.data;
  },

  async remove(id) {
    await http.delete(`/households/${id}`);
  }
};

