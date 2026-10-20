import { authSer } from "../services/auth.js";
import { movieSer } from "../services/movies.js";
import { userSer } from "../services/users.js";
import { presentToast, showAlertError } from "../shared/ui.js";
import template from "./user-details.page.html?raw";
import "./user-details.page.scss";

class UserDetailsPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let imgPhoto = this.querySelector("#photo");
    let h1Name = this.querySelector("#name");
    let pEmail = this.querySelector("#email");
    let badgeAge = this.querySelector("#age");
    let badgeStatus = this.querySelector("#status");
    let spanNbFavorites = this.querySelector("#nb-favorites");
    let favoriteList = this.querySelector("#favorite-list");
    let router = document.querySelector("ion-router");

    // userId comes from the :userId parameter of the /users/:userId route
    let userId = this.userId;

    this.addEventListener("ionViewWillEnter", async () => {
      try {
        let selectedUser = await userSer.getUserById(userId);
        if (!selectedUser) {
          presentToast("User not found", "danger");
          router.push("/users", "root");
          return;
        }

        let tabMovies = await movieSer.getAllMovies();
        let tabFavorites = tabMovies.filter((movie) =>
          selectedUser.favorites.includes(movie.id),
        );

        showUser(selectedUser);
        showFavorites(tabFavorites);
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    function showUser(user) {
      imgPhoto.src = user.photo;
      h1Name.textContent = `${user.firstName} ${user.lastName}`;
      pEmail.textContent = user.email;
      badgeAge.textContent = `${user.age} years old`;

      if (user.role == "admin") {
        badgeStatus.textContent = "Admin";
        badgeStatus.color = "tertiary";
      } else if (user.disabled) {
        badgeStatus.textContent = "Disabled";
        badgeStatus.color = "danger";
      } else {
        badgeStatus.textContent = "Active";
        badgeStatus.color = "success";
      }
    }

    function showFavorites(tabFavorites) {
      spanNbFavorites.textContent = tabFavorites.length;

      if (!tabFavorites.length) {
        favoriteList.innerHTML = `
          <ion-item>
            <ion-badge class="category-badge" color="medium">🎬 No movies</ion-badge>
            <ion-label>This user has no movies in their playlist</ion-label>
          </ion-item>`;
        return;
      }

      favoriteList.innerHTML = "";
      for (let movie of tabFavorites) {
        let newImg = document.createElement("img");
        newImg.src = movie.poster;

        let newThumbnail = document.createElement("ion-thumbnail");
        newThumbnail.slot = "start";
        newThumbnail.className = "poster";
        newThumbnail.appendChild(newImg);

        let newTitle = document.createElement("h2");
        newTitle.textContent = movie.title;

        let newYear = document.createElement("p");
        newYear.textContent = movie.releaseDate
          ? movie.releaseDate.substring(0, 4)
          : "Unknown date";

        let newLabel = document.createElement("ion-label");
        newLabel.appendChild(newTitle);
        newLabel.appendChild(newYear);

        let newItem = document.createElement("ion-item");
        newItem.href = "/details/" + movie.id;
        newItem.appendChild(newThumbnail);
        newItem.appendChild(newLabel);

        favoriteList.appendChild(newItem);
      }
    }
  }
}

customElements.define("app-user-details", UserDetailsPage);
