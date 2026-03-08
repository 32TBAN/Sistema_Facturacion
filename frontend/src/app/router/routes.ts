import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "login",
    component: () => import("@/modules/auth/pages/LoginPage.vue"),
    meta: {
      guestOnly: true,
      layout: "auth",
    },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("@/modules/dashboard/pages/AdminDashboardPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "empleado"],
      layout: "app",
    },
  },
  {
    path: "/inicio",
    name: "inicio",
    component: () => import("@/modules/productos/pages/NuevaFacturaPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "empleado"],
      layout: "app",
    },
  },
  {
    path: "/productsSearch",
    name: "productsSearch",
    component: () => import("@/modules/productos/pages/ProductsSearchPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "empleado", "lector"],
      layout: "app",
    },
  },
  {
    path: "/clientsSearch",
    name: "clientsSearch",
    component: () => import("@/modules/clientes/pages/ClientesPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "empleado", "lector"],
      layout: "app",
    },
  },
  {
    path: "/facturas",
    name: "facturas",
    component: () => import("@/modules/facturas/pages/FacturasPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin", "empleado", "lector"],
      layout: "app",
    },
  },
  {
    path: "/inventory-movements",
    name: "inventoryMovements",
    component: () => import("@/modules/productos/pages/InventoryMovementsPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
      layout: "app",
    },
  },
  {
    path: "/users",
    name: "users",
    component: () => import("@/modules/clientes/pages/UsersPage.vue"),
    meta: {
      requiresAuth: true,
      roles: ["admin"],
      layout: "app",
    },
  },
  {
    path: "/403",
    name: "forbidden",
    component: () => import("@/shared/pages/ForbiddenPage.vue"),
    meta: {
      requiresAuth: true,
      layout: "app",
    },
  },
];

export default routes;
