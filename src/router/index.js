import {createRouter, createWebHistory} from "vue-router";

const LogInComponent = () => import('@/IAM/components/log-in.vue');
const SignUpComponent = () => import('@/IAM/components/signup.vue');
const ForgotPasswordComponent = () => import('@/IAM/components/forgot-password.vue');
const HomeRepresentativeComponent = () => import('@/household-representative/pages/home-representative.component.vue');
const HomeMemberComponent = () => import('@/household-member/pages/home-member.component.vue');

// Member dashboard components
const ContributionsComponent = () => import('@/household-member/components/contributions.component.vue');
const HouseholdStatusComponent = () => import('@/household-member/components/household-status.component.vue');
const SearchHouseholdComponent = () => import('@/household-member/components/search-household.component.vue');
const SettingsComponent = () => import('@/household-member/components/settings.component.vue');
const DashboardHomeComponent = () => import('@/household-member/components/dashboard-home.component.vue');

const routes = [
    { path: '/', component: LogInComponent },
    { path: '/login', name: 'login', component: LogInComponent, meta: { title: 'Login' } },
    { path: '/signup', name: 'signup', component: SignUpComponent, meta: {title: 'SignUp' } },
    { path: '/forgot-password', name: 'forgot-password' ,component: ForgotPasswordComponent , meta: { title: 'Forgot Password' } },
    { 
        path: '/dashboard/representative', 
        name: 'representative-dashboard',
        component: HomeRepresentativeComponent, 
        meta: { 
            requiresAuth: true,
            role: 'representative',
            title: 'Representative Dashboard'
        },
        children: [
            {
                path: '',
                name: 'representative-dashboard-home',
                component: () => import('@/household-representative/components/dashboard-home.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Inicio'
                }
            },
            {
                path: 'create-household',
                name: 'create-household',
                component: () => import('@/household-representative/components/create-household.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Crear Hogar'
                }
            },
            {
                path: 'members',
                name: 'members-management',
                component: () => import('@/household-representative/components/members.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Gestión de Miembros'
                }
            },
            {
                path: 'expenses',
                name: 'expenses-management',
                component: () => import('@/household-representative/components/expenses.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Gestión de Gastos'
                }
            },
            {
                path: 'contribution',
                name: 'contribution-management',
                component: () => import('@/household-representative/components/contribution.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Gestión de Aportes'
                }
            },
            {
                path: 'settings',
                name: 'representative-settings',
                component: () => import('@/household-representative/components/settings.component.vue'),
                meta: {
                    requiresAuth: true,
                    role: 'representative',
                    title: 'Configuración'
                }
            }
        ]
    },
    { 
        path: '/dashboard/member', 
        name: 'member-dashboard',
        component: HomeMemberComponent, 
        meta: { 
            requiresAuth: true,
            role: 'member',
            title: 'Member Dashboard'
        },
        children: [
            {
                path: '',
                name: 'member-dashboard-home',
                component: DashboardHomeComponent,
                meta: {
                    requiresAuth: true,
                    role: 'member',
                    title: 'Inicio'
                }
            },
            {
                path: 'contributions',
                name: 'member-contributions',
                component: ContributionsComponent,
                meta: {
                    requiresAuth: true,
                    role: 'member',
                    title: 'Mis Aportes'
                }
            },
            {
                path: 'household-status',
                name: 'household-status',
                component: HouseholdStatusComponent,
                meta: {
                    requiresAuth: true,
                    role: 'member',
                    title: 'Estado del Hogar'
                }
            },
            {
                path: 'search',
                name: 'search-household',
                component: SearchHouseholdComponent,
                meta: {
                    requiresAuth: true,
                    role: 'member',
                    title: 'Buscar Hogar'
                }
            },
            {
                path: 'settings',
                name: 'member-settings',
                component: SettingsComponent,
                meta: {
                    requiresAuth: true,
                    role: 'member',
                    title: 'Configuración'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (to.meta.requiresAuth && !user) {
        next({ name: 'login' });
    } else if (to.meta.requiresAuth && to.meta.role !== user.role) {
        next({ name: user.role === 'representative' ? 'representative-dashboard' : 'member-dashboard' });
    } else {
        next();
    }
});

export default router;


