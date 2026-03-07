import type { NavigationGuardNext, RouteLocationNormalized, Router } from "vue-router";
import { useAuthStore } from "@/modules/auth/store/auth.store";

function hasRequiredRole(requiredRoles: string[] | undefined, userRoles: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.some((role) => userRoles.includes(role));
}

function resolveHomeByRole(roles: string[]) {
  if (roles.includes("admin")) {
    return { name: "dashboard" };
  }

  return { name: "inicio" };
}

export function registerAuthGuards(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = useAuthStore();

    if (authStore.accessToken && !authStore.user) {
      await authStore.bootstrapSession();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: "login" });
      return;
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      next(resolveHomeByRole(authStore.roles));
      return;
    }

    if (!hasRequiredRole(to.meta.roles as string[] | undefined, authStore.roles)) {
      next({ name: "forbidden" });
      return;
    }

    next();
  });
}
