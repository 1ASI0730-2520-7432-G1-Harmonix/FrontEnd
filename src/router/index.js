import {createRouter, createWebHistory} from "vue-router";

const LogInComponent = () => import('@/public/components/log-in.vue');
const SignUpComponent = () => import('@/public/components/signup.vue');
const ForgotPasswordComponent = () => import('@/public/components/forgot-password.vue');

const routes = [
    { path: '/', component: LogInComponent },
    { path: '/login', name: 'login', component: LogInComponent, meta: { title: 'Login' } },
    { path: '/signup', name: 'signup', component: SignUpComponent, meta: {title: 'SignUp' } },
    { path: '/forgot-password', name: 'forgot-password' ,component: ForgotPasswordComponent , meta: { title: 'Forgot Password' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

export default router;


