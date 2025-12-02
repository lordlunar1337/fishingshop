const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const itemsRouter = require("./api/itemsRouter");
const ordersRouter = require("./api/ordersRouter");

const app = express();
const PORT = 4000;

const rate = new Map();
const WINDOW_MS = 10000;
const MAX_REQ = 8;

const now = () => Date.now();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const rid = req.get("X-Request-Id") || randomUUID();
  req.rid = rid;
  res.setHeader("X-Request-Id", rid);
  next();
});

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local";
  const base = rate.get(ip) || { count: 0, ts: now() };
  const within = now() - base.ts < WINDOW_MS;
  const state = within ? { count: base.count + 1, ts: base.ts } : { count: 1, ts: now() };
  rate.set(ip, state);
  if (state.count > MAX_REQ) {
    res.setHeader("Retry-After", "2");
    return res.status(429).json({
      error: "too_many_requests",
      code: null,
      details: [],
      requestId: req.rid
    });
  }
  next();
});

app.use(async (req, res, next) => {
  const r = Math.random();
  if (r < 0.15) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1200 + Math.floor(Math.random() * 800))
    );
  }
  if (r > 0.8) {
    const err = Math.random() < 0.5 ? "unavailable" : "unexpected";
    const code = err === "unavailable" ? 503 : 500;
    return res.status(code).json({
      error: err,
      code: null,
      details: [],
      requestId: req.rid
    });
  }
  next();
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/items", itemsRouter);
app.use("/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);});