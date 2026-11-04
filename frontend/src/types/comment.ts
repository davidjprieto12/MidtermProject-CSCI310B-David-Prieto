import type { User } from "./auth";

export interface EventComment {
    id: number;
    author: User;
    body: string;
    created_at: string;
}