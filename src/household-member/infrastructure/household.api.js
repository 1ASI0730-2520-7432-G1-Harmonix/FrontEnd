import axios from 'axios';

export const http = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: false
});

const get = async (url) => (await http.get(url)).data ?? [];

export const HouseholdAPI = {
    users: () => get('/users'),
    membersByHousehold: (householdId) => get(`/householdMember?householdId=${householdId}`),
    memberContributions: () => get('/memberContributions'),
    billsByHousehold: (householdId) => get(`/bills?householdId=${householdId}`),
    contributionsByHousehold: (householdId) => get(`/contributions?householdId=${householdId}`),
    householdById: (id) => get(`/households?id=${id}`),
    householdsByRepresentative: (representativeId) => get(`/households?representativeId=${representativeId}`),

    createMember: async (payload) => (await http.post('/householdMember', payload)).data
};
