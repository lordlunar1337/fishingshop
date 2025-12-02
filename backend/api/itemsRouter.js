const express = require("express");
const {
  ValidationError,
  createItem,
  listItems,
  getItemById,
  updateItem,
  deleteItem
} = require("../service/itemService");

const router = express.Router();

function sendError(req, res, status, error, code, details) {
  res.status(status).json({
    error,
    code,
    details: details || [],
    requestId: req.rid
  });
}

router.get("/", async (req, res) => {
  try {
    const items = await listItems();
    res.json(items);
  } catch (err) {
    sendError(req, res, 500, "InternalServerError", "INTERNAL_ERROR", []);
  }
});

router.post("/", async (req, res) => {
  try {
    const created = await createItem(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof ValidationError) {
      sendError(req, res, 400, "ValidationError", err.code, err.details);
      return;
    }
    sendError(req, res, 500, "InternalServerError", "INTERNAL_ERROR", []);
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    sendError(req, res, 400, "ValidationError", "INVALID_ID", [
      { field: "id", message: "Id must be a number" }
    ]);
    return;
  }
  try {
    const item = await getItemById(id);
    if (!item) {
      sendError(req, res, 404, "NotFound", "ITEM_NOT_FOUND", []);
      return;
    }
    res.json(item);
  } catch (err) {
    sendError(req, res, 500, "InternalServerError", "INTERNAL_ERROR", []);
  }
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    sendError(req, res, 400, "ValidationError", "INVALID_ID", [
      { field: "id", message: "Id must be a number" }
    ]);
    return;
  }
  try {
    const updated = await updateItem(id, req.body);
    if (!updated) {
      sendError(req, res, 404, "NotFound", "ITEM_NOT_FOUND", []);
      return;
    }
    res.json(updated);
  } catch (err) {
    if (err instanceof ValidationError) {
      sendError(req, res, 400, "ValidationError", err.code, err.details);
      return;
    }
    sendError(req, res, 500, "InternalServerError", "INTERNAL_ERROR", []);
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    sendError(req, res, 400, "ValidationError", "INVALID_ID", [
      { field: "id", message: "Id must be a number" }
    ]);
    return;
  }
  try {
    const removed = await deleteItem(id);
    if (!removed) {
      sendError(req, res, 404, "NotFound", "ITEM_NOT_FOUND", []);
      return;
    }
    res.status(204).send();
  } catch (err) {
    sendError(req, res, 500, "InternalServerError", "INTERNAL_ERROR", []);
  }
});

module.exports = router;
