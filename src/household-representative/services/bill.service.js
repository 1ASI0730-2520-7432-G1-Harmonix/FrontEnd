import httpInstance from "@/shared/services/http.instance.js";

export class BillService {
    resourceEndpoint= import.meta.env.VITE_BILLS_PATH;

    getAll(){
        return httpInstance.get(this.resourceEndpoint);
    }

    getById(id){
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }

    getByHouseholdId(id){
        return httpInstance.get(`/${this.resourceEndpoint}/?householdId=${id}`);
    }

    getByRepresentativeId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?createdBy=${id}`);
    }

    create(resource){
        return httpInstance.post(this.resourceEndpoint, resource);
    }

    update(id, resource){
        return httpInstance.put(`${this.resourceEndpoint}/${id}`, resource);
    }

    delete(id){
        return httpInstance.delete(`${this.resourceEndpoint}/${id}`);
    }
}