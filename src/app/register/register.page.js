import { User } from "../models/user.model.js";
import { authSer } from "../services/auth.js";
import { photoSer } from "../services/photos.js";
import { presentLoading, presentToast, showAlertError } from "../shared/ui.js";
import template from "./register.page.html?raw";
import "./register.page.scss";

class RegisterPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let inpFirstName = this.querySelector("#first-name");
    let inpLastName = this.querySelector("#last-name");
    let inpAge = this.querySelector("#age");
    let inpEmail = this.querySelector("#email");
    let inpPassword = this.querySelector("#password");
    let divNoPhoto = this.querySelector("#no-photo");
    let divPhoto = this.querySelector("#photo-container");
    let imgPhoto = this.querySelector("#photo-preview");
    let btnPhoto = this.querySelector("#btn-photo");
    let spanBtnPhoto = this.querySelector("#btn-photo-text");
    let btnDeletePhoto = this.querySelector("#btn-delete-photo");
    let btnReset = this.querySelector("#btn-reset");
    let btnRegister = this.querySelector("#btn-register");
    let router = document.querySelector("ion-router");

    let photo = null;
    showPhoto();

    btnPhoto.addEventListener("click", presentActionSheet);

    btnDeletePhoto.addEventListener("click", () => {
      photo = null;
      showPhoto();
    });

    btnReset.addEventListener("click", resetForm);

    btnRegister.addEventListener("click", async () => {
      if (
        !inpFirstName.value.trim().length ||
        !inpLastName.value.trim().length ||
        !inpAge.value ||
        !inpEmail.value.trim().length ||
        !inpPassword.value.length ||
        !photo
      ) {
        showAlertError(
          "Please fill in all fields (first name, last name, age, email, password and photo)",
        );
        return;
      }

      if (+inpAge.value < 1 || +inpAge.value > 120) {
        showAlertError("Please enter a valid age");
        return;
      }

      let newUser = new User(
        null,
        inpFirstName.value.trim(),
        inpLastName.value.trim(),
        +inpAge.value,
        inpEmail.value.trim(),
        photo,
      );

      const loading = await presentLoading("Creating your account...");
      try {
        await authSer.register(newUser, inpPassword.value);
        presentToast("Account created successfully!", "success");
        resetForm();
        router.push("/home", "root");
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Sign-up error");
      } finally {
        loading.dismiss();
      }
    });

    function showPhoto() {
      divNoPhoto.style.display = photo ? "none" : "block";
      divPhoto.style.display = photo ? "block" : "none";
      spanBtnPhoto.textContent = photo ? "Change photo" : "Add a photo";
      if (photo) imgPhoto.src = photo;
    }

    function resetForm() {
      inpFirstName.value = "";
      inpLastName.value = "";
      inpAge.value = "";
      inpEmail.value = "";
      inpPassword.value = "";
      photo = null;
      showPhoto();
    }

    async function presentActionSheet() {
      const actionSheet = document.createElement("ion-action-sheet");
      actionSheet.header = "Add a photo";
      actionSheet.buttons = [
        {
          text: "Take a photo",
          icon: "camera",
          handler: async () => {
            try {
              photo = await photoSer.takePhoto();
              showPhoto();
            } catch (error) {
              console.log("Photo cancelled", error);
            }
          },
        },
        {
          text: "Choose from gallery",
          icon: "image",
          handler: async () => {
            try {
              photo = (await photoSer.choosePhoto()) || photo;
              showPhoto();
            } catch (error) {
              console.log("Selection cancelled", error);
            }
          },
        },
        {
          text: "Cancel",
          icon: "close",
          role: "cancel",
        },
      ];

      document.body.appendChild(actionSheet);
      await actionSheet.present();
    }
  }
}

customElements.define("app-register", RegisterPage);
