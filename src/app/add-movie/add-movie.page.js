import { authSer } from "../services/auth.js";
import { movieSer } from "../services/movies.js";
import { presentLoading, presentToast, showAlertError } from "../shared/ui.js";
import template from "./add-movie.page.html?raw";

class AddMoviePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let inpTitle = this.querySelector("#title");
    let btnSearch = this.querySelector("#btn-search");
    let btnPopular = this.querySelector("#btn-popular");
    let resultList = this.querySelector("#result-list");
    let router = document.querySelector("ion-router");
    let tabExistingIds = [];

    this.addEventListener("ionViewWillEnter", async () => {
      try {
        let tabMovies = await movieSer.getAllMovies();
        tabExistingIds = tabMovies.map((movie) => movie.id);
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    btnSearch.addEventListener("click", search);

    inpTitle.addEventListener("keyup", (event) => {
      if (event.key == "Enter") search();
    });

    btnPopular.addEventListener("click", importPopular);

    async function search() {
      if (!inpTitle.value.trim().length) {
        showAlertError("Please enter the title of the movie to search");
        return;
      }

      const loading = await presentLoading("Searching TMDB...");
      try {
        let tabResults = await movieSer.searchTmdb(inpTitle.value.trim());
        showResults(tabResults);
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "TMDB error");
      } finally {
        loading.dismiss();
      }
    }

    function showResults(tabResults) {
      if (!tabResults.length) {
        resultList.innerHTML = `
          <ion-item>
            <ion-badge class="category-badge" color="medium">🔍 No results</ion-badge>
            <ion-label>No movie found on TMDB</ion-label>
          </ion-item>`;
        return;
      }

      resultList.innerHTML = "";
      for (let movie of tabResults) {
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

        let newIcon = document.createElement("ion-icon");
        newIcon.slot = "icon-only";

        let newButton = document.createElement("ion-button");
        newButton.slot = "end";
        newButton.fill = "clear";
        newButton.appendChild(newIcon);
        markButton(newButton, newIcon, tabExistingIds.includes(movie.id));

        newButton.addEventListener("click", async () => {
          try {
            let added = await movieSer.addMovie(movie);
            if (added) {
              tabExistingIds.push(movie.id);
              presentToast("Movie added successfully", "success");
            } else {
              presentToast("Movie already exists", "danger");
            }
            markButton(newButton, newIcon, true);
          } catch (error) {
            showAlertError(authSer.getErrorMessage(error), "Error");
          }
        });

        let newItem = document.createElement("ion-item");
        newItem.appendChild(newThumbnail);
        newItem.appendChild(newLabel);
        newItem.appendChild(newButton);

        resultList.appendChild(newItem);
      }
    }

    function markButton(button, icon, exists) {
      icon.name = exists ? "checkmark-circle" : "add-circle-outline";
      button.color = exists ? "success" : "primary";
    }

    async function importPopular() {
      const loading = await presentLoading("Importing popular movies...");
      try {
        let tabPopular = await movieSer.getPopularTmdb();
        let nbAdded = 0;
        for (let movie of tabPopular) {
          if (await movieSer.addMovie(movie)) nbAdded++;
        }
        presentToast(`${nbAdded} movie(s) imported successfully`, "success");
        router.push("/home", "root");
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "TMDB error");
      } finally {
        loading.dismiss();
      }
    }
  }
}

customElements.define("app-add-movie", AddMoviePage);
