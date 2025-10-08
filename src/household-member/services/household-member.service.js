import httpInstance from "@/shared/services/http.instance.js";

export class HouseholdMemberService{
    resourceEndpoint = import.meta.env.VITE_HOUSEHOLD_MEMBER_PATH;

    getAll(){
        return httpInstance.get(this.resourceEndpoint);
    }

    getById(id){
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }

    getByUserId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?userId=${id}`);
    }

    getByHouseHoldId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?householdId=${id}`);
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