import {Settings} from "@/settings/domain/models/settings.entity.js";

export function toEntity(resource) {
    if(!dto || typeof dto !== 'object')  return new Settings();
    return new Settings({
        id: resource.id,
        userId: resource.userId,
        language: resource.language,
        darkMode: resource.darkMode,
        notificationEnabled: resource.role,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
    });
}


export function toDTO(entity) {
    if(!entity) return {};
    return {
        id: entity.id,
        userId: (entity.userId || '').trim(),
        language: (entity.language || '').trim(),
        darkMode: (entity.darkMode || '').trim(),
        notificationEnabled: (entity.notificationEnabled || '').trim(),
        createdAt: (entity.createdAt || '').trim(),
        updatedAt: entity.updatedAt,
    }
}