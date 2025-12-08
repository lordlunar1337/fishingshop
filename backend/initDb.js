const db = require("./db");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS items");
  db.run(
    "CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price REAL NOT NULL, category TEXT, createdAt TEXT, updatedAt TEXT)"
  );
  const stmt = db.prepare(
    "INSERT INTO items (name, description, price, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const now = new Date().toISOString();
  const items = [
    ["Вудилище карпове 3.5 lb", "Міцне вудилище для коропової риболовлі", 2500, "Вудилища"],
    ["Котушка 4000", "Котушка для спінінгової риболовлі", 1800, "Котушки"],
    ["Плетена ліска 0.18", "Плетена ліска для дальніх закидів", 700, "Ліска"],
    ["Набір гачків", "Набір гачків різних розмірів", 150, "Гачки"],
    ["Силіконові приманки", "Набір силіконових приманок для хижака", 300, "Приманки"]
  ];
  items.forEach(([name, description, price, category]) =>
    stmt.run(name, description, price, category, now, now)
  );
  stmt.finalize(() => {
    db.close();
  });
});
