class Shipment {
  constructor({ id, orderId, trackingNumber = null, status = "pending", deliveryMethod = "nova_poshta", address, createdAt = new Date(), updatedAt = new Date() }) {
    this.id = id;
    this.orderId = orderId;
    this.trackingNumber = trackingNumber;
    this.status = status;
    this.deliveryMethod = deliveryMethod;
    this.address = address;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  assignTrackingNumber(trackingNumber) {
    this.trackingNumber = trackingNumber;
    this.touch();
  }

  setStatus(newStatus) {
    this.status = newStatus;
    this.touch();
  }

  touch() {
    this.updatedAt = new Date();
  }
}

module.exports = Shipment;
