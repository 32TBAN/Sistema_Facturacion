import { defineStore } from "pinia";
import { authService } from "@/modules/auth/services/auth.service";
import type { AuthUser, LoginPayload } from "@/modules/auth/types/auth.types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
};

const ACCESS_TOKEN_KEY = "sf_access_token";
const REFRESH_TOKEN_KEY = "sf_refresh_token";
const USER_KEY = "sf_user";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    user: JSON.parse(localStorage.getItem(USER_KEY) ?? "null") as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    roles: (state) => state.user?.roles ?? [],
  },
  actions: {
    setSession(payload: { accessToken: string; refreshToken?: string | null; user: AuthUser }) {
      this.accessToken = payload.accessToken;
      this.refreshToken = payload.refreshToken ?? null;
      this.user = payload.user;

      localStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));

      if (payload.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
      }
    },
    async login(payload: LoginPayload) {
      const session = await authService.login(payload);
      this.setSession(session);
    },
    async bootstrapSession() {
      if (!this.accessToken) {
        return;
      }

      if (!this.user) {
        const user = await authService.me(this.accessToken);
        if (user) {
          this.user = user;
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }
    },
    async tryRefreshToken() {
      if (!this.refreshToken) {
        return false;
      }

      const refreshed = await authService.refresh(this.refreshToken);
      if (!refreshed) {
        this.logout();
        return false;
      }

      this.setSession(refreshed);
      return true;
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;

      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});
