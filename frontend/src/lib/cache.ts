// Client-side cache helper using localStorage
export const cache = {
  get: <T>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const val = localStorage.getItem(`cache_${key}`);
      return val ? JSON.parse(val) : fallback;
    } catch (e) {
      console.error("Cache read error:", e);
      return fallback;
    }
  },
  set: (key: string, value: any): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Cache write error:", e);
    }
  }
};
