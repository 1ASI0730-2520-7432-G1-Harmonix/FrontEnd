// main.ts (or main.js)
import { createApp } from 'vue';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import {$t} from '@primeuix/styled';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {
    Button,
    Card,
    Checkbox,
    Column,
    DataTable,
    Dialog,
    Dropdown,
    InputText,
    Password,
    SelectButton,
    Tag,
    Toolbar,
    Divider,
    Message,
    ProgressBar,
    ToastService,
    ConfirmationService,
    DialogService
} from "primevue";
import router from "@/router/index.js";
import i18n from "@/i18n.js";
import Textarea from "primevue/textarea";
// utility classes (grid, spacing, flex, responsive)

const app = createApp(App);

// Register PrimeVue Services
app.use(ToastService);
app.use(ConfirmationService);
app.use(DialogService);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            // optional tweaks
            darkModeSelector: 'system' // 'class' | 'media' | 'system'
        }
    }
});
app.use(router);
app.use(i18n);
app.use(createPinia())
app.component('pv-inputtext', InputText).
component('pv-password', Password ).
component('pv-checkbox', Checkbox).
component('pv-button', Button).
component('pv-divider', Divider).
component('pv-message', Message).
component('pv-select-button', SelectButton).
component('pv-dropdown', Dropdown).
component('pv-datatable', DataTable).
component('pv-column', Column).
component('pv-dialog', Dialog).
component('pv-toolbar', Toolbar).
component('pv-progressbar', ProgressBar).
component('pv-card', Card).
component('pv-tag', Tag).
component('pv-column', Column).
component('pv-datatable', DataTable).
    component('pv-textarea', Textarea);

setUpLocalePersistence();

app.mount('#app');
