<template>
  <div class="app-shell" :class="{ collapsed: isCollapsed }">
    <aside class="sidebar" :class="{ open: mobileOpen }">
      <div class="sidebar-brand">
        <img src="../../assets/carrito.png" alt="logo" width="26" height="26" />
        <div v-if="!isCollapsed" class="brand-copy">
          <strong>FluxFact</strong>
          <small>Billing SaaS</small>
        </div>
      </div>

      <button class="collapse-btn" @click="toggleCollapse" aria-label="colapsar menu">
        {{ isCollapsed ? ">" : "<" }}
      </button>

      <button class="quick-action" @click="goPrimaryAction">
        {{ primaryActionLabel }}
      </button>

      <nav class="sidebar-nav">
        <router-link
          v-for="item in visibleItems"
          :key="item.name"
          class="nav-item"
          :to="item.to"
          :class="{ active: isRouteActive(item.to) }"
          @click="mobileOpen = false"
        >
          <span class="dot" />
          <span v-if="!isCollapsed">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <p v-if="!isCollapsed">Sesion activa</p>
        <button class="logout-btn" @click="logout">Cerrar sesion</button>
      </div>
    </aside>

    <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false" />

    <section class="shell-main">
      <header class="topbar">
        <button class="mobile-menu" @click="mobileOpen = !mobileOpen">Menu</button>
        <div class="turn-bar">
          <span>{{ roleLabel }}</span>
          <span class="separator">|</span>
          <span>Caja 01</span>
          <span class="separator">|</span>
          <span class="live">Online</span>
        </div>
      </header>

      <main class="shell-content">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store";

type NavItem = {
  name: string;
  label: string;
  to: string;
  roles: Array<"admin" | "empleado" | "lector">;
};

const STORAGE_KEY = "sf_sidebar_collapsed";
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const mobileOpen = ref(false);
const isCollapsed = ref(localStorage.getItem(STORAGE_KEY) === "1");

const navItems: NavItem[] = [
  { name: "dashboard", label: "Dashboard", to: "/dashboard", roles: ["admin"] },
  { name: "inicio", label: "Nueva factura", to: "/inicio", roles: ["admin", "empleado"] },
  { name: "productsSearch", label: "Productos", to: "/productsSearch", roles: ["admin", "empleado", "lector"] },
  { name: "clientsSearch", label: "Clientes", to: "/clientsSearch", roles: ["admin", "empleado", "lector"] },
  { name: "facturas", label: "Facturas", to: "/facturas", roles: ["admin", "empleado", "lector"] },
];

const visibleItems = computed(() =>
  navItems.filter((item) => item.roles.some((role) => authStore.roles.includes(role)))
);

const roleLabel = computed(() => {
  if (authStore.roles.includes("admin")) return "Administrador";
  if (authStore.roles.includes("empleado")) return "Empleado";
  if (authStore.roles.includes("lector")) return "Lector";
  return "Sin rol";
});
const primaryActionLabel = computed(() => (authStore.roles.includes("admin") ? "Ver indicadores" : "Nueva factura"));

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem(STORAGE_KEY, isCollapsed.value ? "1" : "0");
};

const goPrimaryAction = async () => {
  if (authStore.roles.includes("admin")) {
    await router.push("/dashboard");
    return;
  }

  if (authStore.roles.includes("empleado")) {
    await router.push("/inicio");
    return;
  }

  await router.push("/facturas");
};

const logout = async () => {
  authStore.logout();
  await router.push({ name: "login" });
};

const isRouteActive = (to: string) => route.path === to;
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 272px 1fr;
  min-height: 100vh;
  background: #f4f7fb;
}

.app-shell.collapsed {
  grid-template-columns: 88px 1fr;
}

.sidebar {
  position: relative;
  z-index: 20;
  background: #f7fafc;
  border-right: 1px solid #dbe2ea;
  padding: 18px 12px;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 14px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-copy {
  display: grid;
  text-align: left;
}

.brand-copy small {
  color: #64748b;
}

.collapse-btn,
.quick-action,
.logout-btn,
.mobile-menu {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
  padding: 8px 10px;
  cursor: pointer;
}

.quick-action {
  background: #1e3a5f;
  color: white;
  border-color: #1e3a5f;
}

.sidebar-nav {
  display: grid;
  gap: 6px;
  align-content: start;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #1f2937;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px;
}

.nav-item.active {
  border-color: #bcd0e9;
  background: #eaf2fc;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #4b5563;
}

.sidebar-footer {
  display: grid;
  gap: 8px;
}

.sidebar-footer p {
  margin: 0;
  color: #475569;
}

.shell-main {
  display: grid;
  grid-template-rows: auto 1fr;
}

.topbar {
  height: 64px;
  border-bottom: 1px solid #dbe2ea;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.turn-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.92rem;
}

.live {
  color: #047857;
  font-weight: 600;
}

.separator {
  color: #94a3b8;
}

.shell-content {
  padding: 18px;
}

.mobile-menu {
  display: none;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 900px) {
  .app-shell,
  .app-shell.collapsed {
    grid-template-columns: 1fr;
  }

  .mobile-menu {
    display: inline-flex;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -300px;
    bottom: 0;
    width: 280px;
    transition: left 180ms ease;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.35);
    z-index: 15;
  }
}
</style>
