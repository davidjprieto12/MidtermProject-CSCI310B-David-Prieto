import { api } from "./client";
import type { LoginInput, RegisterInput, RegisterResponse, TokenResponse, User } from "../types/auth";

export const authApi = {
    register: (data: RegisterInput) =>
        api.post<RegisterResponse>("/auth/register/", data).then((r) => r.data),
    login: (data: LoginInput) =>
        api.post<TokenResponse>("/auth/login/", data).then((r) => r.data),
    me: () => api.get<User>("/auth/me/").then((r) => r.data),
};