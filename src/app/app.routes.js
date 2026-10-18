import { adminGuard, authGuard, guestGuard } from "./guards/auth.guard.js";

export const routes = [
  {
    path: "/home",
    component: "app-home",
    canActivate: authGuard,
  },
  {
    // no redirectTo here: with ion-router, a redirect skips the guard
    path: "/",
    component: "app-home",
    canActivate: authGuard,
  },
  {
    path: "/details/:movieId",
    component: "app-details-movie",
    canActivate: authGuard,
  },
  {
    path: "/add",
    component: "app-add-movie",
    canActivate: adminGuard,
  },
  {
    path: "/users",
    component: "app-users",
    canActivate: adminGuard,
  },
  {
    path: "/playlist",
    component: "app-playlist",
    canActivate: authGuard,
  },
  {
    path: "/matching",
    component: "app-matching",
    canActivate: authGuard,
  },
  {
    path: "/profile",
    component: "app-profile",
    canActivate: authGuard,
  },
  {
    path: "/login",
    component: "app-login",
    canActivate: guestGuard,
  },
  {
    path: "/register",
    component: "app-register",
    canActivate: guestGuard,
  },
];
