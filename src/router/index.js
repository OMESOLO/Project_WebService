import CartList from '@/components/CartList.vue';
import CartShow from '@/components/CartShow.vue';
import PageMember from '@/components/PageMember.vue';
import ProductCreate from '@/components/ProductCreate.vue';
import ProductShow from '@/components/ProductShow.vue';
import TheHome from '@/components/TheHome.vue';
import TheLogin from '@/components/TheLogin.vue';
import TheRegister from '@/components/TheRegister.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: TheHome
    },
    {
        path: '/Login',
        name: 'Login',
        component: TheLogin
    },
    {
        path: '/register',
        name: 'Register',
        component: TheRegister
    },
    {
        path: '/pagemember',
        name: 'PageMember',
        component: PageMember
    },
    {
        path: '/ProductShow/:pdId',
        name: 'ProductShow',
        component: ProductShow
    },
    {
        path: '/cartShow/:cartId',
        name: 'CartShow',
        component: CartShow
    },
    {
        path: '/cartList/',
        name: 'CartList',
        component: CartList
    },
    {
        path: '/product/create',
        name: 'ProductCreate',
        component: ProductCreate
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;
