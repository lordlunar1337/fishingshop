const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { randomUUID } = require("crypto");

const dbPath = path.join(__dirname, "fishing_shop.db");
const db = new sqlite3.Database(dbPath);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const idemStore = new Map();

const rate = new Map();
const WINDOW_MS = 10_000;
const MAX_REQ = 8;
const now = () => Date.now();

const errBody = (req, error, code = null, details = null) => ({
  error,
  code,
  details,
  requestId: req.rid,
});

app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.rid = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local";
  const b = rate.get(ip) ?? { count: 0, ts: now() };
  const within = now() - b.ts < WINDOW_MS;
  const state = within ? { count: b.count + 1, ts: b.ts } : { count: 1, ts: now() };
  rate.set(ip, state);

  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res.status(429).json(errBody(req, "too_many_requests", "RATE_LIMIT", null));
  }

  next();
});

app.use(async (req, res, next) => {
  const r = Math.random();

  if (r < 0.15) {
    await new Promise((x) => setTimeout(x, 1200 + Math.random() * 800));
  }

  if (r > 0.8) {
    const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
    const status = err === "unavailable" ? 503 : 500;
    const code = err === "unavailable" ? "SERVICE_UNAVAILABLE" : "INTERNAL_ERROR";
    return res.status(status).json(errBody(req, err, code, null));
  }

  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/items", (req, res) => {
  db.all(
    "SELECT id, name, description, price, category, createdAt FROM items ORDER BY createdAt DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("DB error in GET /items:", err);
        return res.status(500).json(errBody(req, "db_error", "DB_ERROR", err.message));
      }
      res.json(rows);
    }
  );
});

app.get("/orders", (req, res) => {
  db.all(
    `SELECT 
      id,
      customer_name AS customerName,
      phone,
      item_id AS itemId,
      item_name AS itemName,
      quantity,
      total_price AS totalPrice,
      created_at AS createdAt
     FROM orders
     ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error("DB error in GET /orders:", err);
        return res.status(500).json(errBody(req, "db_error", "DB_ERROR", err.message));
      }
      res.json(rows);
    }
  );
});

app.post("/orders", (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key) {
    return res.status(400).json(errBody(req, "idempotency_key_required", "IDEMPOTENCY_REQUIRED", null));
  }

  if (idemStore.has(key)) {
    return res.status(201).json({ ...idemStore.get(key), requestId: req.rid });
  }

  const { customerName, phone, itemId, itemName, quantity } = req.body;

  if (!customerName || !customerName.trim() || !phone || !phone.trim()) {
    return res.status(400).json(errBody(req, "ValidationError", "NAME_PHONE_REQUIRED", [
      { field: "customerName", message: "Customer name is required" },
      { field: "phone", message: "Phone is required" },
    ]));
  }

  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) {
    return res.status(400).json(errBody(req, "ValidationError", "QUANTITY_INVALID", [
      { field: "quantity", message: "Quantity must be > 0" },
    ]));
  }

  const hasItemInfo =
    (itemId !== null && itemId !== undefined && itemId !== "") ||
    (itemName && String(itemName).trim());

  if (!hasItemInfo) {
    return res.status(400).json(errBody(req, "ValidationError", "ITEM_REQUIRED", [
      { field: "itemId", message: "Item id or item name is required" },
    ]));
  }

  const cleanName = customerName.trim();
  const cleanPhone = phone.trim();
  const cleanItemName = itemName && String(itemName).trim() ? String(itemName).trim() : null;

  const insertOrder = (resolved) => {
    const finalItemId = resolved ? resolved.id : (itemId || null);
    const finalItemName = resolved ? resolved.name : cleanItemName;
    const price = resolved ? resolved.price : null;
    const totalPrice = price != null ? Number(price) * q : null;

    db.run(
      `INSERT INTO orders (customer_name, phone, item_id, item_name, quantity, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanPhone, finalItemId, finalItemName, q, totalPrice],
      function (err) {
        if (err) {
          console.error("DB error in POST /orders:", err);
          return res.status(500).json(errBody(req, "db_error", "DB_ERROR", err.message));
        }

        const payload = {
          id: this.lastID,
          customerName: cleanName,
          phone: cleanPhone,
          itemId: finalItemId,
          itemName: finalItemName,
          quantity: q,
          totalPrice,
          createdAt: new Date().toISOString(),
        };

        idemStore.set(key, payload);
        return res.status(201).json({ ...payload, requestId: req.rid });
      }
    );
  };

  if (itemId) {
    db.get(
      "SELECT id, name, price FROM items WHERE id = ?",
      [itemId],
      (err, row) => {
        if (err) {
          console.error("DB error resolving item in POST /orders:", err);
          return insertOrder(null);
        }
        if (!row) return insertOrder(null);
        insertOrder(row);
      }
    );
  } else {
    insertOrder(null);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
