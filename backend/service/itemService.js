const db = require("../db");

class ValidationError extends Error {
  constructor(code, details) {
    super("ValidationError");
    this.name = "ValidationError";
    this.code = code;
    this.details = details;
  }
}

function validateItemPayload(payload, isUpdate = false) {
  const details = [];
  if (!isUpdate || typeof payload.name !== "undefined") {
    if (!payload.name || typeof payload.name !== "string") {
      details.push({ field: "name", message: "Name is required and must be a string" });
    }
  }
  if (!isUpdate || typeof payload.price !== "undefined") {
    if (typeof payload.price !== "number" || Number.isNaN(payload.price) || payload.price < 0) {
      details.push({ field: "price", message: "Price must be a non-negative number" });
    }
  }
  if (details.length > 0) {
    throw new ValidationError("VALIDATION_ERROR", details);
  }
}

function rowToItem(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function createItem(data) {
  validateItemPayload(data, false);
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO items (name, description, price, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)";
    db.run(
      sql,
      [data.name, data.description || "", data.price, data.category || "", now, now],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        const id = this.lastID;
        db.get("SELECT * FROM items WHERE id = ?", [id], (err2, row) => {
          if (err2) {
            reject(err2);
            return;
          }
          resolve(rowToItem(row));
        });
      }
    );
  });
}

function listItems() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM items", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.map(rowToItem));
    });
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rowToItem(row));
    });
  });
}

function updateItem(id, data) {
  validateItemPayload(data, true);
  const fields = [];
  const params = [];
  if (typeof data.name !== "undefined") {
    fields.push("name = ?");
    params.push(data.name);
  }
  if (typeof data.description !== "undefined") {
    fields.push("description = ?");
    params.push(data.description);
  }
  if (typeof data.price !== "undefined") {
    fields.push("price = ?");
    params.push(data.price);
  }
  if (typeof data.category !== "undefined") {
    fields.push("category = ?");
    params.push(data.category);
  }
  const now = new Date().toISOString();
  fields.push("updatedAt = ?");
  params.push(now);
  params.push(id);
  return new Promise((resolve, reject) => {
    if (fields.length === 1) {
      resolve(null);
      return;
    }
    const sql = `UPDATE items SET ${fields.join(", ")} WHERE id = ?`;
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }
      if (this.changes === 0) {
        resolve(null);
        return;
      }
      db.get("SELECT * FROM items WHERE id = ?", [id], (err2, row) => {
        if (err2) {
          reject(err2);
          return;
        }
        resolve(rowToItem(row));
      });
    });
  });
}

function deleteItem(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}

module.exports = {
  ValidationError,
  validateItemPayload,
  createItem,
  listItems,
  getItemById,
  updateItem,
  deleteItem
};
