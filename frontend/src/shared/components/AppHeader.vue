<template>
  <header class="app-header">
    <router-link class="brand" to="/inicio">
      <img src="../../assets/carrito.png" alt="Inicio" width="30" height="24" />
      <span>Facturacion</span>
    </router-link>

    <nav v-if="isAuthenticated" class="nav-links">
      <router-link v-if="isAdmin" to="/facturas">
        <Button variant="outline" size="sm">Facturas</Button>
      </router-link>
      <router-link to="/productsSearch">
        <Button variant="outline" size="sm">Productos</Button>
      </router-link>
      <router-link to="/clientsSearch">
        <Button variant="outline" size="sm">Clientes</Button>
      </router-link>
      <router-link to="/inicio">
        <Button size="sm">Facturar</Button>
      </router-link>
      <Button variant="destructive" size="sm" @click="logout">Cerrar sesion</Button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { Button } from "@/shared/ui/button";

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.roles.includes("admin"));

const logout = async () => {
  authStore.logout();
  await router.push({ name: "login" });
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #fff;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
