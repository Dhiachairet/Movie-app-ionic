export class User {
  constructor(
    id,
    firstName,
    lastName,
    age,
    email,
    photo,
    role = "user",
    disabled = false,
    favorites = [],
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.email = email;
    this.photo = photo;
    this.role = role;
    this.disabled = disabled;
    this.favorites = favorites;
  }
}
