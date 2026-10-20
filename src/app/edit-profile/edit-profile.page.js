import { User } from "../models/user.model.js";
import { authSer } from "../services/auth.js";
import { userSer } from "../services/users.js";
import {
  presentLoading,
  presentPhotoActionSheet,
  presentToast,
  showAlertError,
} from "../shared/ui.js";
import template from "./edit-profile.page.html?raw";
import "./edit-profile.page.scss";

class EditProfilePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let imgPhoto = this.querySelector("#photo-preview");
    let btnPhoto = this.querySelector("#btn-photo");
    let inpFirstName = this.querySelector("#first-name");
    let inpLastName = this.querySelector("#last-name");
    let inpAge = this.querySelector("#age");
    let inpEmail = this.querySelector("#email");
    let btnCancel = this.querySelector("#btn-cancel");
    let btnSave = this.querySelector("#btn-save");
    let router = document.querySelector("ion-router");

    let photo = null;

    // fill the form with the current information of the connected user
    this.addEventListener("ionViewWillEnter", () => {
      let user = authSer.connectedUser;
      inpFirstName.value = user.firstName;
      inpLastName.value = user.lastName;
      inpAge.value = user.age;
      inpEmail.value = user.email;
      photo = user.photo;
      imgPhoto.src = photo;
    });

    btnPhoto.addEventListener("click", () => {
      presentPhotoActionSheet((newPhoto) => {
        photo = newPhoto;
        imgPhoto.src = photo;
      });
    });

    btnCancel.addEventListener("click", () => {
      router.push("/profile", "back");
    });

    btnSave.addEventListener("click", async () => {
      if (
        !String(inpFirstName.value).trim().length ||
        !String(inpLastName.value).trim().length ||
        !inpAge.value
      ) {
        showAlertError("Please fill in all fields (first name, last name and age)");
        return;
      }

      if (+inpAge.value < 1 || +inpAge.value > 120) {
        showAlertError("Please enter a valid age");
        return;
      }

      let user = authSer.connectedUser;
      let updatedUser = new User(
        user.id,
        String(inpFirstName.value).trim(),
        String(inpLastName.value).trim(),
        +inpAge.value,
        user.email,
        photo,
      );

      const loading = await presentLoading("Saving...");
      try {
        await userSer.updateProfile(updatedUser);
        presentToast("Profile updated successfully", "success");
        router.push("/profile", "back");
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      } finally {
        loading.dismiss();
      }
    });
  }
}

customElements.define("app-edit-profile", EditProfilePage);
