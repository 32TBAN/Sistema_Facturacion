import { createRouter, createWebHistory } from "vue-router";
import ProductList from '../components/ProductList.vue'
import ProductsSearch from '../components/ProductsSearch.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
    {
        path: "/productList",
        component: ProductList,
    },
    {
        path: "/productsSearch",
        component: ProductsSearch,
    },
],
});

export default router
