import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { TOKEN_KEY } from "../api/client";
import { AuthContext } from "./authContext";
import type { LoginInput, User } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    // Is only loading if there is a saved token that needs to be verified
    const [isLoading, setIsLoading] = useState<boolean>(
        () => localStorage.getItem(TOKEN_KEY) !== null
    );

    // Upon loading the page: if a token is saved, ask Django who it belongs to
    useEffect(() => {
        if (!localStorage.getItem(TOKEN_KEY)) return;
        authApi
            .me()
            .then(setUser)
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setIsLoading(false));
    }, []);

    const login = async (input: LoginInput) => {
        const tokens = await authApi.login(input);
        localStorage.setItem(TOKEN_KEY, tokens.access);
        setUser(await authApi.me());
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        queryClient.clear(); // don't leave the last user's data in the cache
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}