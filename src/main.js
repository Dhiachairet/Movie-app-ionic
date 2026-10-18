import { defineCustomElements } from "@ionic/pwa-elements/loader";
import "./global.scss";

import "./app/add-movie/add-movie.page.js";
import "./app/details-movie/details-movie.page.js";
import "./app/home/home.page.js";
import "./app/login/login.page.js";
import "./app/matching/matching.page.js";
import "./app/playlist/playlist.page.js";
import "./app/profile/profile.page.js";
import "./app/register/register.page.js";
import "./app/users/users.page.js";

import "./app/app.component.js";

defineCustomElements(window);
