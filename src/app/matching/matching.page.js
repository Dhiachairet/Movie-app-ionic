import { authSer } from "../services/auth.js";
import { matchingSer, MATCHING_THRESHOLD } from "../services/matching.js";
import { movieSer } from "../services/movies.js";
import { showAlertError } from "../shared/ui.js";
import template from "./matching.page.html?raw";
import "./matching.page.scss";

class MatchingPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = template;

    let divMatches = this.querySelector("#match-list");
    let spanThreshold = this.querySelector("#threshold");
    spanThreshold.textContent = MATCHING_THRESHOLD;

    this.addEventListener("ionViewWillEnter", async () => {
      if (!authSer.connectedUser.favorites.length) {
        divMatches.innerHTML = `
          <div class="empty-state">
            <ion-icon name="heart-dislike-outline"></ion-icon>
            <p>Add movies to your playlist to discover users who share your taste.</p>
          </div>`;
        return;
      }

      divMatches.innerHTML = `<div class="ion-text-center ion-padding"><ion-spinner></ion-spinner></div>`;
      try {
        let tabMovies = await movieSer.getAllMovies();
        let tabMatches = await matchingSer.getMatchingUsers(authSer.connectedUser);
        showMatches(tabMatches, tabMovies);
      } catch (error) {
        divMatches.innerHTML = "";
        showAlertError(authSer.getErrorMessage(error), "Error");
      }
    });

    function showMatches(tabMatches, tabMovies) {
      if (!tabMatches.length) {
        divMatches.innerHTML = `
          <div class="empty-state">
            <ion-icon name="people-outline"></ion-icon>
            <p>No user shares more than ${MATCHING_THRESHOLD}% of your taste yet.</p>
          </div>`;
        return;
      }

      divMatches.innerHTML = "";
      for (let match of tabMatches) {
        let newImg = document.createElement("img");
        newImg.src = match.user.photo;

        let newAvatar = document.createElement("ion-avatar");
        newAvatar.slot = "start";
        newAvatar.appendChild(newImg);

        let newName = document.createElement("h2");
        newName.textContent = `${match.user.firstName} ${match.user.lastName}`;

        let newInfo = document.createElement("p");
        newInfo.textContent = `${match.user.age} years old · ${match.user.favorites.length} movie(s) in their playlist`;

        let newLabel = document.createElement("ion-label");
        newLabel.appendChild(newName);
        newLabel.appendChild(newInfo);

        let newBadge = document.createElement("ion-badge");
        newBadge.slot = "end";
        newBadge.color = "success";
        newBadge.textContent = `${match.rate}%`;

        let newItem = document.createElement("ion-item");
        newItem.lines = "none";
        newItem.appendChild(newAvatar);
        newItem.appendChild(newLabel);
        newItem.appendChild(newBadge);

        let newProgress = document.createElement("ion-progress-bar");
        newProgress.value = match.rate / 100;
        newProgress.color = "success";

        let newCommonTitle = document.createElement("strong");
        newCommonTitle.className = "common-title";
        newCommonTitle.textContent = "Movies in common:";

        let newChips = document.createElement("div");
        for (let movieId of match.common) {
          let movie = tabMovies.find((element) => element.id == movieId);
          if (!movie) continue;

          let newChip = document.createElement("ion-chip");
          newChip.color = "primary";
          newChip.textContent = movie.title;
          newChips.appendChild(newChip);
        }

        let newContent = document.createElement("ion-card-content");
        newContent.appendChild(newCommonTitle);
        newContent.appendChild(newChips);

        let newCard = document.createElement("ion-card");
        newCard.appendChild(newItem);
        newCard.appendChild(newProgress);
        newCard.appendChild(newContent);

        divMatches.appendChild(newCard);
      }
    }
  }
}

customElements.define("app-matching", MatchingPage);
