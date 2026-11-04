import type { User } from "../types/auth";

export const displayName = (user: User): string =>
    user.display_name || user.username;