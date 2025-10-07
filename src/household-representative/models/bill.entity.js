export class Bill {
    constructor(id= "", householdId= "", description= "",
    amount= "", createdBy= 0, paymentDay= "0", createdAt= "", updatedAt= "0") {
        this.id = id;
        this.householdId = householdId;
        this.description = description;
        this.amount = amount;
        this.createdAt = createdAt;
        this.paymentDay = paymentDay;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}