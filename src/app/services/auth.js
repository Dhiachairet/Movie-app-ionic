import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { showAlertError } from "../shared/ui.js";
import { userSer } from "./users.js";

class Auth {
  connectedUser = null;
  unsubscribe = null;

  async register(newUser, password) {
    let result = await createUserWithEmailAndPassword(
      auth,
      newUser.email,
      password,
    );
    newUser.id = result.user.uid;

    try {
      await setDoc(doc(db, "users", newUser.id), {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        age: newUser.age,
        email: newUser.email,
        photo: newUser.photo,
        role: "user",
        disabled: false,
        favorites: [],
      });
    } catch (error) {
      // the profile could not be saved: cancel the account creation
      await deleteUser(result.user);
      throw error;
    }

    await this.listenToUser(newUser.id);
  }

  async login(email, password) {
    let result = await signInWithEmailAndPassword(auth, email, password);
    let profile = await getDoc(doc(db, "users", result.user.uid));

    if (!profile.exists()) {
      await signOut(auth);
      throw { code: "app/no-profile" };
    }
    if (profile.data().disabled) {
      await signOut(auth);
      throw { code: "app/user-disabled" };
    }

    await this.listenToUser(result.user.uid);
  }

  async logout() {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribe = null;
    this.connectedUser = null;
    await signOut(auth);
    this.notifyUserChange();
  }

  async getConnectedUser() {
    await auth.authStateReady();
    if (!auth.currentUser) return null;
    if (!this.connectedUser) await this.listenToUser(auth.currentUser.uid);
    return this.connectedUser;
  }

  isAdmin() {
    return this.connectedUser != null && this.connectedUser.role == "admin";
  }

  // listens in real time to the connected user's profile:
  // the favorites stay up to date, and if the admin disables the account the user is logged out immediately
  listenToUser(userId) {
    if (this.unsubscribe) this.unsubscribe();

    return new Promise((resolve) => {
      this.unsubscribe = onSnapshot(
        doc(db, "users", userId),
        async (profile) => {
          if (!profile.exists()) {
            resolve();
            return;
          }

          this.connectedUser = userSer.toUser(profile.id, profile.data());

          if (this.connectedUser.disabled) {
            await this.logout();
            document.querySelector("ion-router").push("/login", "root");
            showAlertError(
              "Your account has been disabled by the administrator.",
              "Account disabled",
            );
          }

          this.notifyUserChange();
          resolve();
        },
        () => resolve(),
      );
    });
  }

  // tells the menu (app.component.js) that the connected user has changed
  notifyUserChange() {
    document.dispatchEvent(
      new CustomEvent("userChange", { detail: this.connectedUser }),
    );
  }

  getErrorMessage(error) {
    if (error.code && error.code.startsWith("auth/api-key-not-valid")) {
      return "Firebase is not configured: check the src/environments/environment.js file";
    }

    switch (error.code) {
      case "auth/invalid-email":
        return "The email address is invalid.";
      case "auth/email-already-in-use":
        return "This email address is already in use.";
      case "auth/weak-password":
        return "The password must contain at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Incorrect email or password.";
      case "auth/network-request-failed":
        return "Internet connection problem.";
      case "auth/operation-not-allowed":
      case "auth/configuration-not-found":
        return "Enable Email/Password sign-in in Firebase (Authentication > Sign-in method).";
      case "app/user-disabled":
        return "Your account has been disabled by the administrator.";
      case "app/no-profile":
        return "No profile found for this account.";
      case "permission-denied":
        return "Access denied: check the Firestore rules (firestore.rules file).";
      default:
        return error.message || "An error occurred.";
    }
  }
}

export const authSer = new Auth();
