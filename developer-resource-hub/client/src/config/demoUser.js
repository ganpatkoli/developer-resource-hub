/**
 * Must match `USER_SEED_EMAIL` and `USER_SEED_PASSWORD` in server `.env` (npm run seed).
 * Override in client with Vite env if needed.
 */
export const DEMO_ADMIN_EMAIL = import.meta.env.VITE_DEMO_ADMIN_EMAIL || "admin@gmail.com";
export const DEMO_ADMIN_PASSWORD = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "12345";
export const DEMO_USER_EMAIL = import.meta.env.VITE_DEMO_USER_EMAIL || "user@gmail.com";
export const DEMO_USER_PASSWORD = import.meta.env.VITE_DEMO_USER_PASSWORD || "12345";
