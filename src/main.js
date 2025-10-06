// main.ts (or main.js)
import { createApp } from 'vue';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Message from 'primevue/message';
// utility classes (grid, spacing, flex, responsive)

const app = createApp(App);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            // optional tweaks
            darkModeSelector: 'system' // 'class' | 'media' | 'system'
        }
    }
});
app.component('pv-inputtext', InputText).
component('pv-password', Password ).
component('pv-checkbox', Checkbox).
component('pv-button', Button).
component('pv-divider', Divider).
component('pv-message', Message)
app.mount('#app');
