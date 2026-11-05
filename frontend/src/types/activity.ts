import type { User } from "./auth";

export interface ActivityEntry {
    id: number;
    actor: User | null; // null if that account was deleted
    action: string;
    old_value: string;
    new_value: string;
    created_at: string;
}