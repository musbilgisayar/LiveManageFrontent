import { UserDetailRole } from "../types/userDetail.types";

export function canSeeSecurityDetails(role: UserDetailRole) {
  return role === "superadmin" || role === "auditor";
}

export function canSeeLifecycleDetails(role: UserDetailRole) {
  return role === "superadmin" || role === "auditor";
}

export function canSeeSensitiveState(role: UserDetailRole) {
  return role === "superadmin";
}