import axios from "axios"
import toast from "react-hot-toast";

export const TOKEN_KEY = "access";

// Login and register pages show their own errors, so global handler skips them
const FORM_PATHS = ["/auth/login/", "/auth/register/"];

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    // Ensure that a token is not sent to a login/register
    if (token && !FORM_PATHS.includes(config.url ?? "")) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error) && !FORM_PATHS.includes(error.config?.url ?? "")) {
            const status = error.response?.status;
            if (!error.response) {
                toast.error("Can't reach the server.");
            } else if (status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                if (window.location.pathname !== "/login") window.location.assign("/login");
            } else if (status === 403) {
                toast.error("You don't have permission to do that.");
            } else if (status === 404) {
                toast.error("That item was not found.");
            } else if (status !== undefined && status >= 500) {
                toast.error("Server error. Please try again.");
            }
        }
        return Promise.reject(error);
    }
);