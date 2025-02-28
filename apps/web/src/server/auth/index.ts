import { getAuth } from "@/lib/auth";
import { getRequestAuth } from "./getRequestAuth";

// Re-export the getRequestAuth function as getServerSession for API routes
export const getServerSession = getRequestAuth;

// Export additional auth utilities
export { getAuth }; 