const express = require("express");
const { randomUUID } = require("crypto");

const router = express.Router();
const idemStore = new Map();

function sendError(req, res, status, error, code, details) {
  res.status(status).json({
    error,
    code,
    details: details || [],
    requestId: req.rid
  });
}

router.post("/", (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) {
    sendError(req, res, 400, "ValidationError", "IDEMPOTENCY_KEY_REQUIRED", [
      { field: "Idempotency-Key", message: "Idempotency-Key header is required" }
    ]);
    return;
  }
  if (idemStore.has(key)) {
    const existing = idemStore.get(key);
    res.status(201).json({
      ...existing,
      requestId: req.rid
    });
    return;
  }
  const order = {
    id: "ord_" + randomUUID().slice(0, 8),
    title: req.body && req.body.title ? req.body.title : "Untitled"
  };
  idemStore.set(key, order);
  res.status(201).json({
    ...order,
    requestId: req.rid
  });
});

module.exports = router;
