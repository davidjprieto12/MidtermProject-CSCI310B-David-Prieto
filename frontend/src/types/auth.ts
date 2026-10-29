export interface User {
    id: number;
    username: string;
    display_name: string;
    role: "admin" | "member";
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface RegisterInput {
    username: string;
    display_name: string;
    password: string;
    join_code: string;
}

export interface RegisterResponse {
    username: string;
    display_name: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}