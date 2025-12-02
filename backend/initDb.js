const db = require("./db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)"
  );
  db.run("DELETE FROM items");
  const stmt = db.prepare("INSERT INTO items (name) VALUES (?)");
  const items = ["Удочка", "Котушка", "Ліска", "Гачок", "Поплавок"];
  items.forEach((name) => stmt.run(name));
  stmt.finalize(() => {
    db.close();
  });
});
