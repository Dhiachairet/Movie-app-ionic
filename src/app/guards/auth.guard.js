import { authSer } from "../services/auth.js";

// like Angular guards (canActivate):
// return true to allow access, otherwise { redirect: "..." }

export async function authGuard() {
  let user = await authSer.getConnectedUser();
  if (user) return true;
  return { redirect: "/login" };
}

export async function adminGuard() {
  let user = await authSer.getConnectedUser();
  if (user && user.role == "admin") return true;
  return { redirect: user ? "/home" : "/login" };
}

export async function guestGuard() {
  let user = await authSer.getConnectedUser();
  if (!user) return true;
  return { redirect: "/home" };
}
