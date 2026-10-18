import { authSer } from "../services/auth.js";
import { movieSer } from "../services/movies.js";
import { showAlertError } from "../shared/ui.js";
import template from "./home.page.html?raw";

class HomePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let movieList = this.querySelector("#movie-list");
    let inpSearch = this.querySelector("#search");
    let btnAdd = this.querySelector("#btn-add");
    let tabMovies = [];

    // equivalent of ngOnInit: called every time the page is displayed
    this.addEventListener("ionViewWillEnter", async () => {
      btnAdd.style.display = authSer.isAdmin() ? "block" : "none";
      try {
        tabMovies = await movieSer.getAllMovies();
        showMovies();
      } catch (error) {
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    inpSearch.addEventListener("ionInput", showMovies);

    function showMovies() {
      let search = (inpSearch.value || "").trim().toLowerCase();
      let tabFiltered = tabMovies.filter((movie) =>
        movie.title.toLowerCase().includes(search),
      );

      if (!tabFiltered.length) {
        movieList.innerHTML = `
          <ion-item>
            <ion-badge class="category-badge" color="medium">🎬 No movies</ion-badge>
            <ion-label>${tabMovies.length ? "No movie matches your search" : "No movies in the catalog"}</ion-label>
          </ion-item>`;
        return;
      }

      movieList.innerHTML = "";
      for (let movie of tabFiltered) {
        let newImg = document.createElement("img");
        newImg.src = movie.poster;

        let newThumbnail = document.createElement("ion-thumbnail");
        newThumbnail.slot = "start";
        newThumbnail.className = "poster";
        newThumbnail.appendChild(newImg);

        let newTitle = document.createElement("h2");
        newTitle.textContent = movie.title;

        let newInfo = document.createElement("p");
        newInfo.textContent = `${movie.releaseDate ? movie.releaseDate.substring(0, 4) : "—"} · ⭐ ${Number(movie.rating).toFixed(1)}`;

        let newLabel = document.createElement("ion-label");
        newLabel.appendChild(newTitle);
        newLabel.appendChild(newInfo);

        let newItem = document.createElement("ion-item");
        newItem.href = "/details/" + movie.id;
        newItem.appendChild(newThumbnail);
        newItem.appendChild(newLabel);

        // a red heart if the movie is already in my playlist
        if (authSer.connectedUser.favorites.includes(movie.id)) {
          let newIcon = document.createElement("ion-icon");
          newIcon.name = "heart";
          newIcon.color = "danger";
          newIcon.slot = "end";
          newItem.appendChild(newIcon);
        }

        movieList.appendChild(newItem);
      }
    }
  }
}

customElements.define("app-home", HomePage);
