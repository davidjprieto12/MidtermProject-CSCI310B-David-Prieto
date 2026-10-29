import { createContext } from "react";
import type { LoginInput, User } from "../types/auth";

export interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (input: LoginInput) => Promise<void>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);