import { authSer } from "../services/auth.js";
import { movieSer } from "../services/movies.js";
import { userSer } from "../services/users.js";
import { presentToast, showAlertError } from "../shared/ui.js";
import template from "./playlist.page.html?raw";

class PlaylistPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let favoriteList = this.querySelector("#favorite-list");
    let spanTotal = this.querySelector("#total-movies");
    let router = document.querySelector("ion-router");
    let tabFavorites = [];

    this.addEventListener("ionViewWillEnter", async () => {
      try {
        let tabMovies = await movieSer.getAllMovies();
        tabFavorites = tabMovies.filter((movie) =>
          authSer.connectedUser.favorites.includes(movie.id),
        );
        showPlaylist();
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    function showPlaylist() {
      spanTotal.textContent = tabFavorites.length;

      if (!tabFavorites.length) {
        favoriteList.innerHTML = `
          <ion-item>
            <ion-badge class="category-badge" color="medium">🎬 No movies</ion-badge>
            <ion-label>No movies in your playlist</ion-label>
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
        newLabel.className = "clickable";
        newLabel.addEventListener("click", () => {
          router.push("/details/" + movie.id);
        });

        let newIcon = document.createElement("ion-icon");
        newIcon.name = "close-outline";
        newIcon.color = "danger";
        newIcon.slot = "end";
        newIcon.addEventListener("click", () => {
          deleteFavorite(movie);
        });

        let newItem = document.createElement("ion-item");
        newItem.appendChild(newThumbnail);
        newItem.appendChild(newLabel);
        newItem.appendChild(newIcon);

        favoriteList.appendChild(newItem);
      }
    }

    async function deleteFavorite(movie) {
      const alert = document.createElement("ion-alert");
      alert.header = "Remove a movie";
      alert.message = "What would you like to do?";
      alert.buttons = [
        {
          text: "Remove this movie",
          handler: async () => {
            await userSer.removeFavorite(authSer.connectedUser.id, movie.id);
            tabFavorites = tabFavorites.filter((element) => element.id != movie.id);
            showPlaylist();
            presentToast("Movie removed from your playlist", "medium");
          },
        },
        {
          text: "Clear my playlist",
          handler: async () => {
            await userSer.clearFavorites(authSer.connectedUser.id);
            tabFavorites = [];
            showPlaylist();
            presentToast("Your playlist has been cleared", "medium");
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ];

      document.body.appendChild(alert);
      await alert.present();
    }
  }
}

customElements.define("app-playlist", PlaylistPage);
