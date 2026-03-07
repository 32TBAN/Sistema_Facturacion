import type { AuthUser, LoginPayload } from "@/modules/auth/types/auth.types";
import { httpClient } from "@/shared/http/client";

type Session = {
  accessToken: string;
  refreshToken?: string | null;
  user: AuthUser;
};

export const authService = {
  async login(payload: LoginPayload): Promise<Session> {
    // Temporary fallback until backend auth endpoints are available.
    if (payload.username === "admin" && payload.password === "admin") {
      return {
        accessToken: "dev-admin-token",
        refreshToken: "dev-admin-refresh",
        user: {
          id: "1",
          username: payload.username,
          roles: ["admin"],
        },
      };
    }

    if (payload.username === "cajero" && payload.password === "cajero") {
      return {
        accessToken: "dev-cashier-token",
        refreshToken: "dev-cashier-refresh",
        user: {
          id: "2",
          username: payload.username,
          roles: ["cashier"],
        },
      };
    }

    const { data } = await httpClient.post<Session>("/auth/login", payload);
    return data;
  },
  async me(accessToken: string): Promise<AuthUser | null> {
    if (accessToken.startsWith("dev-")) {
      if (accessToken.includes("admin")) {
        return {
          id: "1",
          username: "admin",
          roles: ["admin"],
        };
      }

      return {
        id: "2",
        username: "cajero",
        roles: ["cashier"],
      };
    }

    try {
      const { data } = await httpClient.get<AuthUser>("/auth/me");
      return data;
    } catch {
      return null;
    }
  },
  async refresh(refreshToken: string): Promise<Session | null> {
    if (refreshToken.startsWith("dev-")) {
      return {
        accessToken: refreshToken.replace("refresh", "token"),
        refreshToken,
        user: refreshToken.includes("admin")
          ? { id: "1", username: "admin", roles: ["admin"] }
          : { id: "2", username: "cajero", roles: ["cashier"] },
      };
    }

    try {
      const { data } = await httpClient.post<Session>("/auth/refresh", { refreshToken });
      return data;
    } catch {
      return null;
    }
  },
};
