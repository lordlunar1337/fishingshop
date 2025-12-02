import React, { useState, useEffect } from "react";
import { fetchWithResilience } from "./lib/http";
import { getOrReuseKey } from "./lib/idempotency";

function App() {
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [orderTitle, setOrderTitle] = useState("");
  const [lastOrder, setLastOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [failureCount, setFailureCount] = useState(0);
  const [degraded, setDegraded] = useState(false);
  const [healthStatus, setHealthStatus] = useState("unknown");

  const maxFailures = 3;

  const registerFailure = () => {
    setFailureCount((prev) => {
      const next = prev + 1;
      if (next >= maxFailures) {
        setDegraded(true);
      }
      return next;
    });
  };

  const registerSuccess = () => {
    setFailureCount(0);
    setDegraded(false);
  };

  const loadItems = async () => {
    if (degraded) {
      return;
    }
    setItemsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetchWithResilience("http://localhost:4000/items", {
        method: "GET",
        retry: { retries: 2, baseDelayMs: 250, timeoutMs: 3000, jitter: true }
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrorMessage(body && body.error ? body.error : "Failed to load items");
        registerFailure();
        return;
      }
      const data = await res.json();
      setItems(data);
      registerSuccess();
    } catch (e) {
      setErrorMessage("Network error while loading items");
      registerFailure();
    } finally {
      setItemsLoading(false);
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (degraded) {
      return;
    }
    setErrorMessage("");
    setLastOrder(null);
    const payload = { title: orderTitle || "Untitled" };
    try {
      const key = await getOrReuseKey(payload);
      const res = await fetchWithResilience("http://localhost:4000/orders", {
        method: "POST",
        body: JSON.stringify(payload),
        idempotencyKey: key,
        retry: { retries: 2, baseDelayMs: 300, timeoutMs: 3500, jitter: true }
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMessage(body && body.error ? body.error : "Failed to create order");
        registerFailure();
        return;
      }
      setLastOrder(body);
      registerSuccess();
    } catch (e) {
      setErrorMessage("Network error while creating order");
      registerFailure();
    }
  };

  const checkHealth = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    try {
      const res = await fetch("http://localhost:4000/health", {
        method: "GET",
        signal: controller.signal
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.status) {
        setHealthStatus(data.status);
      } else {
        setHealthStatus("error");
      }
    } catch (e) {
      if (e.name === "AbortError") {
        setHealthStatus("timeout");
      } else {
        setHealthStatus("error");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isActionsDisabled = degraded;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        padding: "2rem",
        maxWidth: "800px",
        margin: "0 auto"
      }}
    >
      <h1>Магазин рибальської снаряги</h1>
      <p>Health: {healthStatus}</p>
      {degraded && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#ffdddd",
            border: "1px solid #ff9999",
            borderRadius: "4px"
          }}
        >
          Сервіс тимчасово перевантажено. Спробуйте пізніше. Дії вимкнено.
        </div>
      )}
      {errorMessage && (
        <p style={{ color: "red" }}>
          {errorMessage}
        </p>
      )}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Товари</h2>
        <button onClick={loadItems} disabled={itemsLoading || isActionsDisabled}>
          {itemsLoading ? "Loading..." : "Load items"}
        </button>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} — {item.price} грн ({item.category})
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Створити замовлення</h2>
        <form onSubmit={submitOrder}>
          <input
            type="text"
            value={orderTitle}
            onChange={(e) => setOrderTitle(e.target.value)}
            placeholder="Назва замовлення"
            disabled={isActionsDisabled}
            style={{ marginRight: "0.5rem" }}
          />
          <button type="submit" disabled={isActionsDisabled}>
            Створити замовлення
          </button>
        </form>
        {lastOrder && (
          <div style={{ marginTop: "1rem" }}>
            <div>Order id: {lastOrder.id}</div>
            <div>Title: {lastOrder.title}</div>
            <div>RequestId: {lastOrder.requestId}</div>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
