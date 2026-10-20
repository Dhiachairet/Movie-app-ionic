import { authSer } from "../services/auth.js";
import { userSer } from "../services/users.js";
import { presentToast, showAlertError } from "../shared/ui.js";
import template from "./users.page.html?raw";

class UsersPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let userList = this.querySelector("#user-list");
    let router = document.querySelector("ion-router");
    let tabUsers = [];

    this.addEventListener("ionViewWillEnter", async () => {
      try {
        tabUsers = await userSer.getAllUsers();
        tabUsers.sort((a, b) => a.lastName.localeCompare(b.lastName));
        showUsers();
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    function showUsers() {
      userList.innerHTML = "";
      for (let user of tabUsers) {
        let newImg = document.createElement("img");
        newImg.src = user.photo;

        let newAvatar = document.createElement("ion-avatar");
        newAvatar.slot = "start";
        newAvatar.appendChild(newImg);

        let newName = document.createElement("h2");
        newName.textContent = `${user.firstName} ${user.lastName}`;

        let newInfo = document.createElement("p");
        newInfo.textContent = `${user.email} · ${user.age} years old`;

        let newStatus = document.createElement("p");
        showStatus(newStatus, user);

        let newLabel = document.createElement("ion-label");
        newLabel.appendChild(newName);
        newLabel.appendChild(newInfo);
        newLabel.appendChild(newStatus);

        // clicking the photo or the name opens the user's details (not the toggle)
        newAvatar.className = "clickable";
        newLabel.className = "clickable";
        newAvatar.addEventListener("click", () => {
          router.push("/users/" + user.id);
        });
        newLabel.addEventListener("click", () => {
          router.push("/users/" + user.id);
        });

        let newItem = document.createElement("ion-item");
        newItem.appendChild(newAvatar);
        newItem.appendChild(newLabel);

        if (user.role == "admin") {
          let newBadge = document.createElement("ion-badge");
          newBadge.slot = "end";
          newBadge.color = "tertiary";
          newBadge.textContent = "Admin";
          newItem.appendChild(newBadge);
        } else {
          let newToggle = document.createElement("ion-toggle");
          newToggle.slot = "end";
          newToggle.checked = !user.disabled;
          newToggle.setAttribute("aria-label", "Active account");
          newToggle.addEventListener("ionChange", (event) => {
            if (event.detail.checked) enableUser(user, newStatus);
            else disableUser(user, newToggle, newStatus);
          });
          newItem.appendChild(newToggle);
        }

        userList.appendChild(newItem);
      }
    }

    function showStatus(pStatus, user) {
      pStatus.textContent = user.disabled ? "Account disabled" : "Account active";
      pStatus.style.color = user.disabled
        ? "var(--ion-color-danger)"
        : "var(--ion-color-success)";
    }

    async function enableUser(user, pStatus) {
      await userSer.setDisabled(user.id, false);
      user.disabled = false;
      showStatus(pStatus, user);
      presentToast(`${user.firstName} ${user.lastName} has been re-enabled`, "success");
    }

    async function disableUser(user, toggle, pStatus) {
      const alert = document.createElement("ion-alert");
      alert.header = "Confirmation";
      alert.message = `Are you sure you want to disable ${user.firstName} ${user.lastName}?`;
      alert.backdropDismiss = false;
      alert.buttons = [
        {
          text: "No",
          role: "cancel",
          handler: () => {
            toggle.checked = true;
          },
        },
        {
          text: "Yes",
          handler: async () => {
            await userSer.setDisabled(user.id, true);
            user.disabled = true;
            showStatus(pStatus, user);
            presentToast(`${user.firstName} ${user.lastName} has been disabled`, "warning");
          },
        },
      ];

      document.body.appendChild(alert);
      await alert.present();
    }
  }
}

customElements.define("app-users", UsersPage);
