import {createRouter, createWebHistory} from '@ionic/vue-router';
import {RouteRecordRaw} from 'vue-router';
import {Preferences} from "@capacitor/preferences";
import LoginPage from '@/views/LoginPage.vue';
import MainLayout from '@/views/MainLayout.vue';
import NewsPage from '@/views/NewsPage.vue';
import PromoPage from '@/views/PromoPage.vue';
import WalletPage from '@/views/WalletPage.vue';
import NotifyPage from '@/views/NotifyPage.vue';
import ProfilePage from '@/views/ProfilePage.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
    },
    {
        path: '/main/',
        component: MainLayout,
        children: [
            {path: '', redirect: '/main/news'},
            {path: 'news', component: NewsPage},
            {path: 'promo', component: PromoPage},
            {path: 'wallet', component: WalletPage},
            {path: 'notify', component: NotifyPage},
            {path: 'profile', component: ProfilePage}
        ]
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, from, next) =>
{
    const tokenData = await Preferences.get({key: 'auth_token'});
    const isAuth = !!tokenData.value;

    if (to.path.startsWith('/main') && !isAuth)
    {
        return next('/login');
    }

    if (to.path === '/login' && isAuth)
    {
        return next('/main');
    }

    return next();
});

router.afterEach(() =>
{
    if (document.activeElement instanceof HTMLElement)
    {
        document.activeElement.blur();
    }
});


export default router
