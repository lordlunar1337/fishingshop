import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/items", (req, res) => {
  db.all("SELECT id, name FROM items", (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Database error" });
      return;
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
