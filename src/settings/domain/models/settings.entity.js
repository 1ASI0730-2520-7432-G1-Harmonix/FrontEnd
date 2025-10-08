export class Settings {
    constructor({id= "", userId= 0, language= "",
                    darkMode= false, notificationEnabled= false, createdAt = '', updatedAt= ''}) {
        this.id = id;
        this.userId= userId;
        this.language = language;
        this.darkMode = darkMode;
        this.notificationEnabled = notificationEnabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    validate(){
        const errors = {};
        if(!this.userId) errors.userId = 'UserId is required';
        if(!this.language) errors.language = 'Language is required';
        if(!this.darkMode) errors.darkMode = 'DarkMode is required';
        if(!this.notificationEnabled) errors.notificationEnabled = 'Notifications is required';
        if(!this.createdAt) errors.status = 'Created Ats is required';
        return Object.keys(errors).length === 0 ? null : errors;
    }
}