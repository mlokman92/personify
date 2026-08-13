/**
 * Shared shape for the auth forms. This lives outside "use server" files:
 * a server-actions module may only export async functions.
 */
export type AuthState = { error: string | null; notice: string | null };

export const initialAuthState: AuthState = { error: null, notice: null };
