import { authSer } from "../services/auth.js";
import { presentToast } from "../shared/ui.js";
import template from "./profile.page.html?raw";
import "./profile.page.scss";

class ProfilePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let imgPhoto = this.querySelector("#photo");
    let h1Name = this.querySelector("#name");
    let pEmail = this.querySelector("#email");
    let badgeAge = this.querySelector("#age");
    let badgeRole = this.querySelector("#role");
    let badgeFavorites = this.querySelector("#nb-favorites");
    let btnLogout = this.querySelector("#btn-logout");
    let router = document.querySelector("ion-router");

    this.addEventListener("ionViewWillEnter", () => {
      let user = authSer.connectedUser;
      imgPhoto.src = user.photo;
      h1Name.textContent = `${user.firstName} ${user.lastName}`;
      pEmail.textContent = user.email;
      badgeAge.textContent = `${user.age} years old`;
      badgeRole.style.display = authSer.isAdmin() ? "inline-block" : "none";
      badgeFavorites.textContent = user.favorites.length;
    });

    btnLogout.addEventListener("click", presentAlert);

    async function presentAlert() {
      const alert = document.createElement("ion-alert");
      alert.header = "Log out";
      alert.message = "Are you sure you want to log out?";
      alert.buttons = [
        "No",
        {
          text: "Yes",
          handler: async () => {
            await authSer.logout();
            presentToast("You are logged out", "medium");
            router.push("/login", "root");
          },
        },
      ];

      document.body.appendChild(alert);
      await alert.present();
    }
  }
}

customElements.define("app-profile", ProfilePage);
