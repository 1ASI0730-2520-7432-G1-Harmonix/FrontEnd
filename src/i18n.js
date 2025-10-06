import {createI18n} from "vue-i18n";

const i18n = createI18n({
    legacy: true,
    locale: 'en',
    globalInjection: true,
    messages:{
        es,
        en
    }
})

export default i18n;