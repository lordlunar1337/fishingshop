import { useState } from "react";

function App() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [orderPhone, setOrderPhone] = useState("");
  const [orderItem, setOrderItem] = useState("");
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  const handleLoadItems = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:4000/items");
      if (!response.ok) {
        throw new Error("Failed to load items");
      }
      const data = await response.json();
      setItems(data);
    } catch (e) {
      setError("Не вдалося завантажити товари. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOrderModal = () => {
    setOrderError("");
    setOrderSuccess("");
    setIsOrderModalOpen(true);
    if (items.length > 0 && !orderItem) {
      setOrderItem(String(items[0].id));
    }
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setOrderError("");
    setOrderSuccess("");
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    if (!orderName.trim() || !orderPhone.trim()) {
      setOrderError("Будь ласка, заповніть ім'я та телефон.");
      return;
    }

    if (!orderItem) {
      setOrderError("Оберіть товар для замовлення.");
      return;
    }

    if (Number(orderQuantity) <= 0) {
      setOrderError("Кількість повинна бути більшою за 0.");
      return;
    }

    setOrderSuccess("Замовлення створено (демо-режим). Дані збережено лише локально.");
  };

  const selectedItem =
    items.find((i) => String(i.id) === String(orderItem)) || null;

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <h1 className="app-title">🎣 FishHook Shop</h1>
          <p className="app-subtitle">
            Магазин рибальської снаряги: вудилища, котушки, приманки та все, що потрібно для
            вдалої рибалки.
          </p>
          <div className="app-actions">
            <button
              className="primary-button"
              type="button"
              onClick={handleOpenOrderModal}
            >
              Створити замовлення
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={handleLoadItems}
              disabled={isLoading}
            >
              {isLoading ? "Завантаження..." : "Завантажити товари"}
            </button>
          </div>
          {error && <div className="alert-error">{error}</div>}
        </div>
      </header>

      <main className="app-main">
        <section className="items-section">
          <div className="items-header">
            <h2 className="items-title">Каталог товарів</h2>
            <span className="items-count">
              {items.length > 0 ? `Знайдено: ${items.length}` : "Список поки що порожній"}
            </span>
          </div>

          {isLoading && (
            <div className="items-loading">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          )}

          {!isLoading && items.length > 0 && (
            <div className="items-grid">
              {items.map((item) => (
                <article key={item.id} className="item-card">
                  <div className="item-card-header">
                    <h3 className="item-name">{item.name}</h3>
                    {item.category && (
                      <span className="item-category">{item.category}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <div className="item-footer">
                    {item.price !== undefined && (
                      <span className="item-price">
                        {item.price.toFixed
                          ? item.price.toFixed(2)
                          : Number(item.price).toFixed(2)}{" "}
                        ₴
                      </span>
                    )}
                    {item.createdAt && (
                      <span className="item-meta">
                        Додано: {new Date(item.createdAt).toLocaleDateString("uk-UA")}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {!isLoading && !error && items.length === 0 && (
            <div className="empty-state">
              <p>Натисніть кнопку вище, щоб завантажити актуальний список товарів.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>© {new Date().getFullYear()} FishHook Shop</span>
          <span>Курсова робота: онлайн-магазин рибальської снаряги</span>
        </div>
      </footer>

      {isOrderModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseOrderModal}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2 className="modal-title">Створення замовлення</h2>
            <p className="modal-subtitle">
              Це демо-форма. Замовлення поки що не відправляється на бекенд, а зберігається
              тільки в стані застосунку.
            </p>
            <form className="modal-form" onSubmit={handleOrderSubmit}>
              <div className="form-row">
                <label className="form-label" htmlFor="order-name">
                  Ім&apos;я
                </label>
                <input
                  id="order-name"
                  className="form-input"
                  type="text"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  placeholder="Ваше ім'я"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="order-phone">
                  Телефон
                </label>
                <input
                  id="order-phone"
                  className="form-input"
                  type="tel"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  placeholder="+38 (0XX) XXX-XX-XX"
                />
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="order-item">
                  Товар
                </label>
                {items.length > 0 ? (
                  <select
                    id="order-item"
                    className="form-input"
                    value={orderItem}
                    onChange={(e) => setOrderItem(e.target.value)}
                  >
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="order-item"
                    className="form-input"
                    type="text"
                    value={orderItem}
                    onChange={(e) => setOrderItem(e.target.value)}
                    placeholder="Введіть назву товару"
                  />
                )}
              </div>

              <div className="form-row">
                <label className="form-label" htmlFor="order-quantity">
                  Кількість
                </label>
                <input
                  id="order-quantity"
                  className="form-input"
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>

              {selectedItem && (
                <div className="form-row form-row-note">
                  <span className="form-note">
                    Орієнтовна сума:{" "}
                    {selectedItem.price
                      ? (Number(selectedItem.price) * Number(orderQuantity || 1)).toFixed(2)
                      : "—"}{" "}
                    ₴
                  </span>
                </div>
              )}

              {orderError && <div className="alert-error">{orderError}</div>}
              {orderSuccess && <div className="alert-success">{orderSuccess}</div>}

              <div className="modal-actions">
                <button className="secondary-button" type="button" onClick={handleCloseOrderModal}>
                  Закрити
                </button>
                <button className="primary-button" type="submit">
                  Підтвердити замовлення
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
