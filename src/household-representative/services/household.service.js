import httpInstance from "@/shared/services/http.instance.js";

export class HouseholdService {
    resourceEndpoint = import.meta.env.VITE_HOUSEHOLDS_ENDPOINT_PATH;

    getAll(){
        return httpInstance.get(this.resourceEndpoint);
    }

    getById(id){
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }
    getByRepresentativeId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?representativeId=${representativeId}`);
    }

    create(resource){
        return httpInstance.post(this.resourceEndpoint, resource);
    }

    update(id, resource){
        return httpInstance.put(`${this.resourceEndpoint}/${id}`, resource)
    }

    delete(id){
        return httpInstance.delete(`${this.resourceEndpoint}/${id}`);
    }
}