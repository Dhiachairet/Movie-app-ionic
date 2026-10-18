import { authSer } from "../services/auth.js";
import { presentLoading, presentToast, showAlertError } from "../shared/ui.js";
import template from "./login.page.html?raw";
import "./login.page.scss";

class LoginPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let inpEmail = this.querySelector("#email");
    let inpPassword = this.querySelector("#password");
    let btnLogin = this.querySelector("#btn-login");
    let btnRegister = this.querySelector("#btn-register");
    let router = document.querySelector("ion-router");

    btnLogin.addEventListener("click", login);

    inpPassword.addEventListener("keyup", (event) => {
      if (event.key == "Enter") login();
    });

    btnRegister.addEventListener("click", () => {
      router.push("/register");
    });

    async function login() {
      if (!inpEmail.value.trim().length || !inpPassword.value.length) {
        showAlertError("Please enter your email and password");
        return;
      }

      const loading = await presentLoading("Signing in...");
      try {
        await authSer.login(inpEmail.value.trim(), inpPassword.value);
        presentToast(`Welcome ${authSer.connectedUser.firstName}!`, "success");
        router.push("/home", "root");
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Login error");
      } finally {
        loading.dismiss();
      }
    }
  }
}

customElements.define("app-login", LoginPage);
