import { userSer } from "./users.js";

export const MATCHING_THRESHOLD = 75;

class Matching {
  // rate = movies in common / distinct movies across both playlists (Jaccard index)
  // e.g. A = [1, 2, 3, 4] and B = [1, 2, 3, 4, 5] => 4 / 5 = 80%
  computeRate(tabFavoritesA, tabFavoritesB) {
    let union = new Set([...tabFavoritesA, ...tabFavoritesB]);
    if (union.size == 0) return 0;

    let common = tabFavoritesA.filter((id) => tabFavoritesB.includes(id));
    return (common.length / union.size) * 100;
  }

  async getMatchingUsers(connectedUser) {
    let tabUsers = await userSer.getAllUsers();
    let tabMatches = [];

    for (let user of tabUsers) {
      if (user.id == connectedUser.id || user.disabled) continue;

      let rate = this.computeRate(connectedUser.favorites, user.favorites);
      if (rate > MATCHING_THRESHOLD) {
        tabMatches.push({
          user: user,
          rate: Math.round(rate),
          common: connectedUser.favorites.filter((id) =>
            user.favorites.includes(id),
          ),
        });
      }
    }

    return tabMatches.sort((a, b) => b.rate - a.rate);
  }
}

export const matchingSer = new Matching();
