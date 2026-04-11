import type { GooglePendingSession, NavigateFn, NavigationData } from "@/app/navigation/types";

export type { NavigationData };

// Backward-compatible aliases used by App/AppRoutes.
export type GoogleAuthSession = GooglePendingSession;
export type NavigateHandler = NavigateFn;
