export class Settings {
    constructor({id= "", userId= 0, language= "",
                    darkMode= false, notificationEnabled= false}) {
        this.id = id;
        this.language = language;
        this.darkMode = darkMode;
        this.notificationEnabled = notificationEnabled;
    }
}