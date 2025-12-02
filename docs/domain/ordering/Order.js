const OrderItem = require("./OrderItem");

class Order {
  constructor({ id, customerId, items = [], status = "draft", createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.customerId = customerId;
    this.items = items;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  addItem({ itemId, name, unitPrice, quantity }) {
    const existing = this.items.find((i) => i.itemId === itemId);
    if (existing) {
      existing.changeQuantity(existing.quantity + quantity);
    } else {
      const orderItem = new OrderItem({ itemId, name, unitPrice, quantity });
      this.items.push(orderItem);
    }
    this.touch();
  }

  removeItem(itemId) {
    this.items = this.items.filter((i) => i.itemId !== itemId);
    this.touch();
  }

  getTotalAmount() {
    return this.items.reduce((sum, item) => sum + item.getTotal(), 0);
  }

  setStatus(newStatus) {
    this.status = newStatus;
    this.touch();
  }

  touch() {
    this.updatedAt = new Date();
  }
}

module.exports = Order;
