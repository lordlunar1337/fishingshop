class User {
  constructor({ id, email, name, role = "customer", createdAt = new Date() }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.role = role;
    this.createdAt = createdAt;
  }

  changeName(newName) {
    this.name = newName;
  }

  changeRole(newRole) {
    this.role = newRole;
  }
}

module.exports = User;
