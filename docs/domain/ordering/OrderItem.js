class OrderItem {
  constructor({ itemId, name, unitPrice, quantity }) {
    this.itemId = itemId;
    this.name = name;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
  }

  changeQuantity(newQuantity) {
    this.quantity = newQuantity;
  }

  getTotal() {
    return this.unitPrice * this.quantity;
  }
}

module.exports = OrderItem;
