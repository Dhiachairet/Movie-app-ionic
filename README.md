# MovieApp: Ionic mini-project (plain JavaScript + Firebase)

A movie app: users register with a camera photo, log in, build a playlist of favorite movies, and find other users whose taste matches theirs by more than 75%. An admin fills the catalog from TMDB and can disable users (never delete them).

**Stack:** Ionic 9 (loaded from the CDN, like TP1) · plain JavaScript (no framework) · Vite · Capacitor 8 + `@capacitor/camera` (like TP2) · Firebase Auth + Firestore · TMDB API.

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Firebase
1. Create a project on https://console.firebase.google.com
2. **+ Add app → Web (`</>`)**: register an app and copy the `firebaseConfig` object into `src/environments/environment.js`.
3. **Authentication → Sign-in method**: enable **Email/Password**.
4. **Firestore Database → Create database** (Standard edition, production mode).
5. **Firestore → Rules**: paste the contents of `firestore.rules`, then **Publish**.

### 3. TMDB
Create a free account on https://www.themoviedb.org, then go to **Settings → API** and copy the short **API Key** (not the long Read Access Token) into `tmdbApiKey` in `src/environments/environment.js`.

### 4. Run
```bash
npm run dev
```
Open the address Vite prints (normally http://localhost:8100, the same port as `ionic serve`).

### 5. Create the admin
1. Register an account in the app.
2. In the Firebase console, go to **Firestore → users →** your document and change `role` from `"user"` to `"admin"`.
3. Reload the app. The **Administration** section appears in the menu, plus a **+** button on the catalog.

### 6. Fill the starting database
As admin: **Menu → Add movies → Import popular movies** (imports 20 TMDB movies), or search a title and tap ⊕.

### 7. Test the matching
Create a second user (in a private window) whose playlist has 4 of the admin's 5 movies: 4/5 = **80%**. Then open **Matching**.

### 8. Android (Capacitor, Chapter 5)
```bash
npm run android      # = vite build + npx cap sync android + npx cap open android
```
Android Studio opens and you run the app on an emulator or a phone. Ionic is loaded from the CDN, so the phone needs internet (Firebase and TMDB need it anyway).

---

## Project structure (same organisation as the TP2 correction)

```
src/
├── main.js                     ← like main.ts (pwa-elements, pages)
├── global.scss
├── environments/environment.js ← Firebase + TMDB keys
└── app/
    ├── app.component.html/.js  ← <ion-app>, side menu, <ion-router-outlet>
    ├── app.routes.js           ← routes array, like app.routes.ts
    ├── firebase.js             ← initializeApp, auth, db
    ├── guards/auth.guard.js    ← authGuard, adminGuard, guestGuard
    ├── models/                 ← Movie, User (classes, like course.model.ts)
    ├── services/               ← auth, movies, users, matching, photos
    ├── shared/ui.js            ← presentToast, showAlertError, presentLoading
    └── <page>/<page>.page.html/.js/.scss   ← one folder per page
```

Each page is a **custom element** (`customElements.define("app-home", HomePage)`). Its HTML lives in `.page.html` (like `templateUrl`), and its code uses the TP1 style: `querySelector`, `addEventListener`, `document.createElement("ion-…")`.

| Angular (TP2) | Here (plain JS) |
|---|---|
| `@Component({ selector: "app-home", templateUrl })` | `customElements.define("app-home", …)` + `import template from "./home.page.html?raw"` |
| `ngOnInit()` | `this.addEventListener("ionViewWillEnter", …)` |
| `inject(GestionCourses)` | `import { movieSer } from "../services/movies.js"` (one shared instance) |
| `activatedRoute.snapshot.paramMap.get("courseId")` | `this.movieId` (Ionic passes the `:movieId` route parameter) |
| `[routerLink]="['/details', id]"` | `newItem.href = "/details/" + id` |
| `router.navigateByUrl("/")` | `document.querySelector("ion-router").push("/home", "root")` |
| `AlertController` / `ToastController` / `ActionSheetController` | `document.createElement("ion-alert")` … `.present()` (like TP1) |
| `canActivate` guards | `beforeEnter` on each `<ion-route>` |

---

## Where each requirement is implemented

| Requirement | Where |
|---|---|
| Registration (first name, last name, age, camera photo) | `register/` + `services/photos.js` (`Camera.takePhoto`, like TP2) + `services/auth.js` → `register()` |
| Authentication | `login/` + `services/auth.js` → `login()` (Firebase Auth) + `guards/auth.guard.js` |
| Favorites playlist | `details-movie/` (add/remove button) + `playlist/` (TP1-style alert: "Remove this movie / Clear my playlist / Cancel") |
| Admin adds movies to the starting database | `add-movie/` + `services/movies.js` → `searchTmdb()`, `getPopularTmdb()`, `addMovie()` |
| Admin deletes a movie | trash icon on `details-movie/` (like the TP2 delete) |
| Admin disables a user (no deletion) | `users/` (`ion-toggle` + confirmation) → `disabled: true`. A disabled user is refused at login and kicked out live (`onSnapshot` in `auth.js`); `firestore.rules` blocks them on the server too |
| Data in Firebase | Firestore collections `users` and `movies`; the photo is compressed to 300px and stored as base64 (Firebase Storage needs a paid plan) |
| Matching > 75% | `services/matching.js` (`computeRate`, `MATCHING_THRESHOLD`) + `matching/` |

### Matching formula
```
rate = movies in common / distinct movies across both playlists × 100   (Jaccard index)
A = [1,2,3,4]   B = [1,2,3,4,5]   →   4 / 5 = 80%  ✓ (> 75%)
A = [1,2,3]     B = [1,2,3,4]     →   3 / 4 = 75%  ✗ (must exceed 75%)
```
Disabled users never appear in the results.

### Firestore data
```
users/{uid}    firstName, lastName, age, email, photo (base64), role ("user" | "admin"), disabled, favorites [movieId…]
movies/{id}    title, overview, poster, releaseDate, rating        (id = TMDB id)
```
