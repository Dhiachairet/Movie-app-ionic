import { routes } from "./app.routes.js";
import { authSer } from "./services/auth.js";
import { presentToast } from "./shared/ui.js";
import template from "./app.component.html?raw";

class AppComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let router = this.querySelector("ion-router");
    let menu = this.querySelector("ion-menu");
    let menuPhoto = this.querySelector("#menu-photo");
    let menuName = this.querySelector("#menu-name");
    let menuEmail = this.querySelector("#menu-email");
    let menuAdmin = this.querySelector("#menu-admin");
    let btnLogout = this.querySelector("#btn-logout");

    // build the <ion-route> elements from the routes array (like app.routes.ts in Angular)
    for (let route of routes) {
      if (route.redirectTo) {
        let newRedirect = document.createElement("ion-route-redirect");
        newRedirect.from = route.path;
        newRedirect.to = route.redirectTo;
        router.appendChild(newRedirect);
      } else {
        let newRoute = document.createElement("ion-route");
        newRoute.url = route.path;
        newRoute.component = route.component;
        newRoute.beforeEnter = route.canActivate;
        router.appendChild(newRoute);
      }
    }

    // the menu is updated on every login / logout
    document.addEventListener("userChange", (event) => {
      let user = event.detail;
      menu.disabled = !user;
      if (!user) return;

      menuPhoto.src = user.photo;
      menuName.textContent = `${user.firstName} ${user.lastName}`;
      menuEmail.textContent = user.email;
      menuAdmin.style.display = user.role == "admin" ? "block" : "none";
    });

    btnLogout.addEventListener("click", async () => {
      await authSer.logout();
      presentToast("You are logged out", "medium");
      router.push("/login", "root");
    });
  }
}

customElements.define("app-root", AppComponent);
