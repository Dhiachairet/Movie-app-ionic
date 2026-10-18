import { authSer } from "../services/auth.js";
import { movieSer } from "../services/movies.js";
import { userSer } from "../services/users.js";
import { presentToast, showAlertError } from "../shared/ui.js";
import template from "./details-movie.page.html?raw";
import "./details-movie.page.scss";

class DetailsMoviePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let btnDelete = this.querySelector("#btn-delete");
    let imgPoster = this.querySelector("#poster");
    let h1Title = this.querySelector("#title");
    let badgeYear = this.querySelector("#year");
    let badgeRating = this.querySelector("#rating");
    let pOverview = this.querySelector("#overview");
    let btnFavorite = this.querySelector("#btn-favorite");
    let iconFavorite = this.querySelector("#icon-favorite");
    let spanFavorite = this.querySelector("#text-favorite");
    let router = document.querySelector("ion-router");

    // movieId comes from the :movieId parameter of the /details/:movieId route
    let movieId = this.movieId;
    let selectedMovie = null;

    this.addEventListener("ionViewWillEnter", async () => {
      try {
        selectedMovie = await movieSer.getMovieById(movieId);
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
        return;
      }

      if (!selectedMovie) {
        presentToast("Movie not found", "danger");
        router.push("/home", "root");
        return;
      }

      btnDelete.style.display = authSer.isAdmin() ? "block" : "none";
      imgPoster.src = selectedMovie.poster;
      h1Title.textContent = selectedMovie.title;
      badgeYear.textContent = selectedMovie.releaseDate || "Unknown date";
      badgeRating.textContent = `⭐ ${Number(selectedMovie.rating).toFixed(1)} / 10`;
      pOverview.textContent = selectedMovie.overview || "No overview available.";
      updateFavoriteButton();
    });

    btnFavorite.addEventListener("click", async () => {
      try {
        if (isFavorite()) {
          await userSer.removeFavorite(authSer.connectedUser.id, selectedMovie.id);
          presentToast("Movie removed from your playlist", "medium");
        } else {
          await userSer.addFavorite(authSer.connectedUser.id, selectedMovie.id);
          presentToast("Movie added to your playlist", "success");
        }
        updateFavoriteButton();
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    btnDelete.addEventListener("click", presentAlert);

    function isFavorite() {
      return authSer.connectedUser.favorites.includes(selectedMovie.id);
    }

    function updateFavoriteButton() {
      iconFavorite.name = isFavorite() ? "heart-dislike-outline" : "heart-outline";
      spanFavorite.textContent = isFavorite()
        ? "Remove from my playlist"
        : "Add to my playlist";
      btnFavorite.color = isFavorite() ? "danger" : "primary";
      btnFavorite.fill = isFavorite() ? "outline" : "solid";
    }

    async function presentAlert() {
      const alert = document.createElement("ion-alert");
      alert.header = "Confirmation";
      alert.message = "Are you sure you want to delete this movie?";
      alert.buttons = [
        "No",
        {
          text: "Yes",
          handler: async () => {
            await movieSer.deleteMovie(selectedMovie.id);
            presentToast("Movie deleted successfully", "success");
            router.push("/home", "root");
          },
        },
      ];

      document.body.appendChild(alert);
      await alert.present();
    }
  }
}

customElements.define("app-details-movie", DetailsMoviePage);
