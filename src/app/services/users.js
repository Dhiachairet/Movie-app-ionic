import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { User } from "../models/user.model.js";

class Users {
  async getAllUsers() {
    let result = await getDocs(collection(db, "users"));
    return result.docs.map((element) => this.toUser(element.id, element.data()));
  }

  async setDisabled(userId, disabled) {
    await updateDoc(doc(db, "users", userId), { disabled: disabled });
  }

  async addFavorite(userId, movieId) {
    await updateDoc(doc(db, "users", userId), {
      favorites: arrayUnion(movieId),
    });
  }

  async removeFavorite(userId, movieId) {
    await updateDoc(doc(db, "users", userId), {
      favorites: arrayRemove(movieId),
    });
  }

  async clearFavorites(userId) {
    await updateDoc(doc(db, "users", userId), { favorites: [] });
  }

  toUser(id, data) {
    return new User(
      id,
      data.firstName,
      data.lastName,
      data.age,
      data.email,
      data.photo,
      data.role,
      data.disabled,
      data.favorites || [],
    );
  }
}

// a single instance shared by the whole app (like an Angular service)
export const userSer = new Users();
