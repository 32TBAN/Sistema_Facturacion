import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "inicio",
    component: () => import("../components/ProductList.vue"),
  },  {
    path: "/productsSearch",
    name: "productsSearch",
    component: () => import("../components/ProductsSearch.vue"),
  },{
    path: "/clientsSearch",
    name: "clientsSearch",
    component: () => import("../components/ClienetsList.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
