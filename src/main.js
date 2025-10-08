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
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Password,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    ToastService,
    Toolbar,
    Divider,
    Message
} from "primevue";
import router from "@/router/index.js";
import i18n, {setUpLocalePersistence} from "@/i18n.js";
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
app.component('pv-inputtext', InputText).
component('pv-password', Password ).
component('pv-checkbox', Checkbox).
component('pv-button', Button).
component('pv-divider', Divider).
component('pv-message', Message).
component('pv-select-button', SelectButton)

setUpLocalePersistence();

app.mount('#app');
