import httpInstance from "@/shared/services/http.instance.js";

export class ContributionsService {
    resourceEndpoint = import.meta.env.VITE_CONTRIBUTIONS_PATH;


    getAll(){
        return httpInstance.get(this.resourceEndpoint);
    }

    getById(id){
        return httpInstance.get(`${this.resourceEndpoint}/${id}`);
    }

    getByBillId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?billId=${id}`);
    }

    getHouseHoldId(id){
        return httpInstance.get(`${this.resourceEndpoint}/?householdId=${id}`);
    }
}