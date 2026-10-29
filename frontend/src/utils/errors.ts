import axios from "axios";

export type FieldErrors = Record<string, string[]>;

export interface ParsedError {
    message: string | null; // general problem, like for wrong passwords
    fields: FieldErrors; // per-field problems from a 400
}

export function parseApiError(error: unknown): ParsedError {
    if (!axios.isAxiosError(error)) {
        return { message: "Something went wrong.", fields: {} };
    }
    if (!error.response) {
        return { message: "Can't reach the server.", fields: {} };
    }
    const data: unknown = error.response.data;
    if (error.response.status === 400 && typeof data === "object" && data !== null) {
        return { message: null, fields: data as FieldErrors };
    }
    if (typeof data === "object" && data !== null && "detail" in data && typeof data.detail === "string") {
        return { message: data.detail, fields: {} };
    }
    return { message: "Something went wrong.", fields: {} };
}

