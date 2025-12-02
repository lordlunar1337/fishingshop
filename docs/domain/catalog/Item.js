class Item {
  constructor({ id, name, description, price, categoryId, stockQuantity, isActive = true }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.categoryId = categoryId;
    this.stockQuantity = stockQuantity;
    this.isActive = isActive;
  }

  changePrice(newPrice) {
    this.price = newPrice;
  }

  adjustStock(delta) {
    this.stockQuantity += delta;
    if (this.stockQuantity < 0) {
      this.stockQuantity = 0;
    }
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }
}

module.exports = Item;
