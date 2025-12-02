import React, { useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:4000/items");
      if (!response.ok) {
        throw new Error("Failed to load items");
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto"
      }}
    >
      <h1>Магазин рибальської снаряги</h1>
      <button onClick={loadItems} disabled={loading}>
        {loading ? "Loading..." : "Load items"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.id}. {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
