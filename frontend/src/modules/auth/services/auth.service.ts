import type { AuthUser, LoginPayload } from "@/modules/auth/types/auth.types";
import { httpClient } from "@/shared/http/client";

export type Session = {
  accessToken: string;
  refreshToken?: string | null;
  user: AuthUser;
};

type LoginResponse = {
  accessToken: string;
  refreshToken?: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "empleado" | "lector";
  };
};

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string | null;
};

export const authService = {
  async login(payload: LoginPayload): Promise<Session> {
    const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        roles: [data.user.role],
      },
    };
  },
  async refresh(refreshToken: string): Promise<RefreshResponse | null> {
    try {
      const { data } = await httpClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
      return data;
    } catch {
      return null;
    }
  },
  async logout(refreshToken: string) {
    await httpClient.post("/auth/logout", { refreshToken });
  },
};
