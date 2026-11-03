const pad = (n: number) => String(n).padStart(2, "0");

// Reformat time for viewer
export function toLocalInput(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}