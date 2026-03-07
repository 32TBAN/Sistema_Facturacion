const routes = [
  {
    path: "/",
    name: "inicio",
    component: () => import("@/modules/auth/pages/LoginPage.vue"),
  },
  {
    path: "/productsSearch",
    name: "productsSearch",
    component: () => import("@/modules/productos/pages/ProductsSearchPage.vue"),
  },
  {
    path: "/clientsSearch",
    name: "clientsSearch",
    component: () => import("@/modules/clientes/pages/ClientesPage.vue"),
  },
  {
    path: "/inicio",
    name: "inicioLogin",
    component: () => import("@/modules/productos/pages/ProductosPage.vue"),
  },
  {
    path: "/facturas",
    name: "facturas",
    component: () => import("@/modules/facturas/pages/FacturasPage.vue"),
  },
];

export default routes;
