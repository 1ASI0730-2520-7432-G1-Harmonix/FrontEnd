import {User} from "@/IAM/domain/model/user.entity.js";

export function toEntity(dto) {
    if(!dto || typeof dto !== 'object')  return new User();
    return new User({
        id: dto.id,
        personName: dto.personName,
        email: dto.email,
        password: dto.password,
        role: dto.role.toLowerCase(),
        status: dto.status,
        householdId: dto.householdId
    });
}


export function toDTO(entity) {
    if(!entity) return {};
    return {
        id: entity.id,
        personName: (entity.personName || '').trim(),
        email: (entity.email || '').trim(),
        password: (entity.password || '').trim(),
        role: (entity.role || '').trim(),
        status: (entity.status|| '').trim(),
        householdId: entity.householdId,
    }
}