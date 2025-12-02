class Category {
  constructor({ id, name, description }) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  rename(newName) {
    this.name = newName;
  }

  changeDescription(newDescription) {
    this.description = newDescription;
  }
}

module.exports = Category;
