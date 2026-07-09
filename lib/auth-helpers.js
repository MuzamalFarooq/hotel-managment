import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireRole(allowedRoles) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return user;
}

export function isGeneralManager(user) {
  return user?.role === "General Manager";
}

export function isReceptionist(user) {
  return user?.role === "Receptionist";
}

export function isHousekeeping(user) {
  return user?.role === "Housekeeping";
}

export const PERMISSIONS = {
  dashboard: ["General Manager", "Receptionist", "Housekeeping"],
  rooms: ["General Manager", "Receptionist"],
  bookings: ["General Manager", "Receptionist"],
  customers: ["General Manager", "Receptionist"],
  maintenance: ["General Manager", "Housekeeping"],
  analytics: ["General Manager"],
  staff: ["General Manager"]
};

export function hasPermission(role, feature) {
  const allowedRoles = PERMISSIONS[feature];
  return allowedRoles ? allowedRoles.includes(role) : false;
}
