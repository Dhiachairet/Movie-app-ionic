// Copy this file to environment.js (same folder) and replace the values with your own keys.
// environment.js is ignored by git, so your keys are never pushed to GitHub.
// Firebase: Firebase console > Project settings > Your apps > SDK configuration
// TMDB: https://www.themoviedb.org/settings/api (free v3 API key)

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
  },
  tmdbApiKey: "YOUR_TMDB_KEY",
  tmdbUrl: "https://api.themoviedb.org/3",
  tmdbImageUrl: "https://image.tmdb.org/t/p/w500",
};
