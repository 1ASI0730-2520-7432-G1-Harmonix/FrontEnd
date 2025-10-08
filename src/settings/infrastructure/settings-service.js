import {User} from "@/IAM/domain/model/user.entity.js";
import {UserApi} from "@/IAM/infrastructure/user-api.js";
import {toDTO, toEntity} from "@/IAM/infrastructure/user.assembler.js";
import {Settings} from "@/settings/domain/models/settings.entity.js";
import {SettingsApi} from "@/settings/infrastructure/settings-api.js";

export class SettingsService {
    static async createSettings(settingsData) {
        const settings = new Settings(settingsData);
        const errors = settingsData.validate;
        if(!errors) throw errors;

        const created = await SettingsApi.create(toDTO());
        return toEntity(created);
    }

    static async getSettingsById(id) {
        if(!id) {
            console.error('ID is not valid');
            throw new Error(`ID doesn't exist`);
        }
        try {
            const dto = await SettingsApi.getById(id);
            if(!dto) throw new Error(`Wasnt able to find a user with id ${id}`);
            return toEntity(dto);
        }catch (error){
            console.error('Error fetching Settings: ',error);
            throw new Error(error.message || 'We are not able to obtain the settings');
        }
    }

    static async getSettingsByUserId(id) {
        if(!id) {
            console.error('ID is not valid');
            throw new Error(`ID doesn't exist`);
        }
        try {
            const dto = await SettingsApi.getByUserId(id);
            if(!dto) throw new Error(`Wasnt able to find a user with id ${id}`);
            return toEntity(dto);
        }catch (error){
            console.error('Error fetching Settings: ',error);
            throw new Error(error.message || 'We are not able to obtain the settings');
        }
    }


    static async updateSettings(id, settingsData) {
        try {
            const settings = new Settings(settingsData);
            const errors = settings.validate();
            if(errors) throw errors;

            const currentSettings = await this.getSettingsById(id);
            if(!currentSettings) throw new Error(`Settings with id ${id} not found`);

            const dataToSend = {
                ...currentSettings,
                userId: settings.userId.trim(),
                language: settings.language?.trim() || '',
                darkMode: settings.darkMode,
                notificationEnabled: settings.notificationEnabled?.trim() || '',
                createdAt: settings.createdAt?.trim() || '',
                updatedAt: settings.updatedAt?.trim() || '',
            }

            const settingsToUpdate = await this.getSettingsById(id);
            if (!settingsToUpdate) throw new Error('No se encontró el settings para actualizar');

            const updated = await SettingsApi.update(settingsToUpdate.id, toDTO(dataToSend));
            if (!updated) throw new Error('No se recibió respuesta del servidor');
            return toEntity(updated);
        }catch (error){
            console.error('Error fetching Settings: ',error);
            throw new Error(error.message || 'We are not able to obtain the settings');
        }

    }

    static async deleteSettings(id) {
        await SettingsApi.remove(id);
    }
}