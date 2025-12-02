class Payment {
  constructor({ id, orderId, amount, status = "pending", method = "cash_on_delivery", createdAt = new Date(), completedAt = null }) {
    this.id = id;
    this.orderId = orderId;
    this.amount = amount;
    this.status = status;
    this.method = method;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
  }

  markAuthorized() {
    this.status = "authorized";
    this.completedAt = new Date();
  }

  markPaid() {
    this.status = "paid";
    this.completedAt = new Date();
  }

  markFailed() {
    this.status = "failed";
    this.completedAt = new Date();
  }
}

module.exports = Payment;
