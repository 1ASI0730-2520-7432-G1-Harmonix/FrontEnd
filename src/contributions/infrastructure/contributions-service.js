import {MemberContributionApi} from "@/contributions/infrastructure/contributions-api.js";
import {toDTO, toEntity} from "@/contributions/infrastructure/contributions.assembler.js";
import {MemberContribution} from "@/contributions/domain/models/contribution.entity.js";

export class MemberContributionService {
    static async createContribution(data) {
        const now = new Date().toISOString();
        const mc = new MemberContribution({
            ...data,
            createdAt: data?.createdAt || now,
            updatedAt: data?.updatedAt || now,
        });
        const errors = mc.validate();
        if (errors) throw errors;

        const created = await MemberContributionApi.create(toDTO(mc));
        return toEntity(created);
    }

    static async getContributionById(id) {
        if (!id) throw new Error("ID is not valid");
        const dto = await MemberContributionApi.getById(id);
        if (!dto) throw new Error(`Wasn't able to find memberContribution with id ${id}`);
        return toEntity(dto);
    }

    static async listByMemberId(memberId) {
        if (!memberId) throw new Error("memberId is not valid");
        const arr = await MemberContributionApi.listByMemberId(memberId);
        return (arr || []).map(toEntity);
    }

    static async listByBillId(billId) {
        if (!contributionId) throw new Error("contributionId is not valid");
        const arr = await MemberContributionApi.listByBillId(billId);
        return (arr || []).map(toEntity);
    }

    static async updateContribution(id, data) {
        if (!id) throw new Error("ID is not valid");

        const current = await this.getContributionById(id);
        if (!current) throw new Error(`Record with id ${id} not found`);

        const merged = new MemberContribution({
            ...toDTO(current),
            ...data,
            id: current.id,
            updatedAt: new Date().toISOString(),
        });

        const errors = merged.validate();
        if (errors) throw errors;

        const updated = await MemberContributionApi.update(id, toDTO(merged));
        if (!updated) throw new Error("No response from server");
        return toEntity(updated);
    }

    static async deleteContribution(id) {
        if (!id) throw new Error("ID is not valid");
        await MemberContributionApi.remove(id);
    }
}