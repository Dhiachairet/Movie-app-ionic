import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { environment } from "../../environments/environment.js";
import { db } from "../firebase.js";
import { Movie } from "../models/movie.model.js";

class Movies {
  async getAllMovies() {
    let result = await getDocs(
      query(collection(db, "movies"), orderBy("title")),
    );
    return result.docs.map((element) =>
      this.toMovie(element.id, element.data()),
    );
  }

  async getMovieById(id) {
    let result = await getDoc(doc(db, "movies", id));
    if (!result.exists()) return undefined;
    return this.toMovie(result.id, result.data());
  }

  // returns false if the movie is already in the database
  async addMovie(newMovie) {
    let existing = await getDoc(doc(db, "movies", newMovie.id));
    if (existing.exists()) return false;

    await setDoc(doc(db, "movies", newMovie.id), {
      title: newMovie.title,
      overview: newMovie.overview || "",
      poster: newMovie.poster,
      releaseDate: newMovie.releaseDate || "",
      rating: newMovie.rating || 0,
    });
    return true;
  }

  async deleteMovie(movieId) {
    await deleteDoc(doc(db, "movies", movieId));

    // also remove this movie from the users' playlists
    let result = await getDocs(
      query(collection(db, "users"), where("favorites", "array-contains", movieId)),
    );
    for (let user of result.docs) {
      await updateDoc(user.ref, { favorites: arrayRemove(movieId) });
    }
  }

  async searchTmdb(title) {
    let response = await fetch(
      `${environment.tmdbUrl}/search/movie?api_key=${environment.tmdbApiKey}&language=en-US&query=${encodeURIComponent(title)}`,
    );
    return await this.readTmdbResponse(response);
  }

  async getPopularTmdb() {
    let response = await fetch(
      `${environment.tmdbUrl}/movie/popular?api_key=${environment.tmdbApiKey}&language=en-US`,
    );
    return await this.readTmdbResponse(response);
  }

  async readTmdbResponse(response) {
    let data = await response.json();
    if (!response.ok) {
      throw new Error(data.status_message || "Error while calling TMDB");
    }
    return data.results.map((film) => this.fromTmdb(film));
  }

  fromTmdb(film) {
    return new Movie(
      String(film.id),
      film.title,
      film.overview,
      film.poster_path
        ? environment.tmdbImageUrl + film.poster_path
        : "assets/no-poster.svg",
      film.release_date,
      film.vote_average,
    );
  }

  toMovie(id, data) {
    return new Movie(
      id,
      data.title,
      data.overview,
      data.poster,
      data.releaseDate,
      data.rating,
    );
  }
}

export const movieSer = new Movies();
