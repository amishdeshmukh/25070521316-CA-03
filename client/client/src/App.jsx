
import { useMemo, useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 1499, emoji: "🎧", color: "lavender", rating: "4.8" },
  { id: 2, name: "Classic Sneakers", category: "Fashion", price: 2199, emoji: "👟", color: "peach", rating: "4.7" },
  { id: 3, name: "Smart Watch", category: "Electronics", price: 2999, emoji: "⌚", color: "blue", rating: "4.9" },
  { id: 4, name: "Coffee Mug", category: "Home", price: 349, emoji: "☕", color: "green", rating: "4.6" },
  { id: 5, name: "Travel Backpack", category: "Accessories", price: 1299, emoji: "🎒", color: "pink", rating: "4.5" },
  { id: 6, name: "Desk Lamp", category: "Home", price: 799, emoji: "💡", color: "yellow", rating: "4.7" },
  { id: 7, name: "Sunglasses", category: "Fashion", price: 599, emoji: "🕶️", color: "blue", rating: "4.6" },
  { id: 8, name: "Plant Pot", category: "Home", price: 299, emoji: "🪴", color: "green", rating: "4.8" },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    const name = email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    // Demo login only. Real authentication will be connected later.
    setUser({ name: name || "Customer", email });
    setActiveTab("Overview");
    setPassword("");
  }

  function handleLogout() {
    setUser(null);
    setEmail("");
    setPassword("");
    setError("");
    setActiveTab("Overview");
    setCartOpen(false);
  }

  function addToCart(product) {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === product.id);

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to your bag`);
    window.setTimeout(() => setNotice(""), 2200);
  }

  function changeQuantity(productId, amount) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleWishlist(productId) {
    setWishlist((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId]
    );
  }

  function selectTab(tab) {
    setActiveTab(tab);
    setSearch("");
  }

  function renderProductCard(product) {
    const isFavorite = wishlist.includes(product.id);

    return (
      <article className="product-card" key={product.id}>
        <div className={`product-art ${product.color}`}>
          <span className="product-emoji">{product.emoji}</span>
          <button
            className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
            onClick={() => toggleWishlist(product.id)}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            title="Toggle wishlist"
          >
            {isFavorite ? "♥" : "♡"}
          </button>
          <span className="rating">★ {product.rating}</span>
        </div>

        <div className="product-details">
          <span className="product-category">{product.category}</span>
          <h3>{product.name}</h3>

          <div className="product-bottom">
            <strong>{formatPrice(product.price)}</strong>
            <button
              className="add-button"
              onClick={() => addToCart(product)}
              aria-label={`Add ${product.name} to cart`}
            >
              +
            </button>
          </div>
        </div>
      </article>
    );
  }

  if (!user) {
    return (
      <main className="login-page">
        <section className="login-visual">
          <a className="brand brand-light" href="#home">
            <span className="brand-symbol">S</span>
            <span>ShopLite</span>
          </a>

          <div className="visual-copy">
            <span className="visual-label">YOUR EVERYDAY SHOPPING PLACE</span>
            <h1>
              Make room for
              <br />
              <span>something good.</span>
            </h1>
            <p>
              Discover your favorites, explore new finds, and enjoy
              a shopping experience made for you.
            </p>

            <div className="visual-products" aria-hidden="true">
              <div className="floating-product floating-one">🎧</div>
              <div className="floating-product floating-two">👟</div>
              <div className="floating-product floating-three">☕</div>
              <div className="floating-product floating-four">⌚</div>
              <span className="visual-sparkle sparkle-one">✦</span>
              <span className="visual-sparkle sparkle-two">✧</span>
            </div>
          </div>

          <p className="visual-footer">
            A little joy in every order. © 2026 ShopLite
          </p>
        </section>

        <section className="login-panel">
          <div className="login-card">
            <div className="mobile-brand">
              <span className="brand-symbol">S</span>
              ShopLite
            </div>

            <span className="eyebrow">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p className="login-subtitle">
              Enter your details to open your shopping dashboard.
            </p>

            <form onSubmit={handleLogin} className="login-form">
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="password-label">
                <label htmlFor="password">Password</label>
                <span className="password-hint">Minimum 6 characters</span>
              </div>

              <div className="input-wrap">
                <span className="input-icon">♙</span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {error && <p className="error-message">{error}</p>}

              <button type="submit" className="login-button">
                Sign in <span>→</span>
              </button>
            </form>

            <div className="login-divider">
              <span />
              <small>YOUR SHOPPING, YOUR WAY</small>
              <span />
            </div>

            <div className="login-benefits">
              <span>✓ Easy shopping</span>
              <span>✓ Personal wishlist</span>
              <span>✓ Simple cart</span>
            </div>

            <p className="login-note">
              Frontend preview: any valid email and a password of at least
              six characters will open the demo dashboard.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const displayedProducts =
    activeTab === "Wishlist"
      ? filteredProducts.filter((product) => wishlist.includes(product.id))
      : filteredProducts;

  const pageTitle = {
    Overview: "Overview",
    Products: "Explore products",
    Orders: "My orders",
    Wishlist: "My wishlist",
  }[activeTab];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-symbol">S</span>
          <span>ShopLite</span>
        </a>

        <div className="sidebar-label">YOUR SPACE</div>

        <nav className="sidebar-nav">
          {[
            { name: "Overview", icon: "▦" },
            { name: "Products", icon: "◇" },
            { name: "Orders", icon: "▤" },
            { name: "Wishlist", icon: "♡" },
          ].map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activeTab === item.name ? "active" : ""
              }`}
              onClick={() => selectTab(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Wishlist" && wishlist.length > 0 && (
                <span className="nav-count">{wishlist.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">✦</span>
            <strong>Good finds await!</strong>
            <p>Explore products you'll love.</p>
            <button onClick={() => selectTab("Products")}>
              Start exploring →
            </button>
          </div>

          <div className="profile-row">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{user.name}</strong>
              <span>Shopper account</span>
            </div>
            <button
              className="logout-button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>ShopLite</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{activeTab}</strong>
          </div>

          <div className="topbar-actions">
            <label className="dashboard-search">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  if (
                    event.target.value &&
                    activeTab !== "Products" &&
                    activeTab !== "Wishlist"
                  ) {
                    setActiveTab("Products");
                  }
                }}
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping cart"
            >
              ♧
              <span className="cart-badge">{cartCount}</span>
            </button>

            <div className="topbar-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR SHOPPING SPACE</span>
              <h1>{pageTitle}</h1>
              <p>
                {activeTab === "Overview"
                  ? `Welcome back, ${user.name}! Here's a little inspiration for today.`
                  : activeTab === "Products"
                    ? "Find something that makes your day a little better."
                    : activeTab === "Wishlist"
                      ? "All the things you've saved in one place."
                      : "Keep track of your shopping activity."}
              </p>
            </div>
            <button
              className="outline-button"
              onClick={() => setCartOpen(true)}
            >
              ♧ My bag <span>{cartCount}</span>
            </button>
          </div>

          {activeTab === "Overview" && (
            <>
              <section className="welcome-banner">
                <div className="banner-copy">
                  <span className="banner-label">A FRESH NEW FINDS</span>
                  <h2>
                    Your next favorite
                    <br />
                    thing is waiting.
                  </h2>
                  <p>Discover little upgrades for your everyday life.</p>
                  <button
                    className="banner-button"
                    onClick={() => selectTab("Products")}
                  >
                    Explore collection <span>→</span>
                  </button>
                </div>
                <div className="banner-art" aria-hidden="true">
                  <div className="banner-orbit" />
                  <div className="banner-item banner-item-a">🎧</div>
                  <div className="banner-item banner-item-b">👟</div>
                  <div className="banner-item banner-item-c">⌚</div>
                  <span className="banner-star star-a">✦</span>
                  <span className="banner-star star-b">✧</span>
                </div>
              </section>

              <section className="stat-grid">
                <article className="stat-card">
                  <div className="stat-icon stat-purple">◇</div>
                  <span>Products to explore</span>
                  <strong>{products.length}</strong>
                  <small>Curated for your day</small>
                </article>
                <article className="stat-card">
                  <div className="stat-icon stat-peach">♡</div>
                  <span>Saved favorites</span>
                  <strong>{wishlist.length}</strong>
                  <small>Your personal wishlist</small>
                </article>
                <article className="stat-card">
                  <div className="stat-icon stat-green">♧</div>
                  <span>Items in your bag</span>
                  <strong>{cartCount}</strong>
                  <small>{formatPrice(cartTotal)} total</small>
                </article>
              </section>
            </>
          )}

          {activeTab === "Orders" ? (
            <section className="empty-state">
              <div className="empty-illustration">📦</div>
              <h2>Your order history starts here</h2>
              <p>
                You haven't placed any orders yet. Browse the collection
                and find something you love.
              </p>
              <button
                className="login-button empty-action"
                onClick={() => selectTab("Products")}
              >
                Browse products →
              </button>
              <p className="demo-caption">
                This is a frontend preview. Orders are not saved yet.
              </p>
            </section>
          ) : (
            <section className="products-section">
              <div className="section-title-row">
                <div>
                  <span className="eyebrow">
                    {activeTab === "Wishlist"
                      ? "YOUR SAVED FINDS"
                      : "HANDPICKED FOR YOU"}
                  </span>
                  <h2>
                    {activeTab === "Wishlist"
                      ? "Favorites"
                      : activeTab === "Products"
                        ? "All products"
                        : "Popular right now"}
                  </h2>
                </div>

                <button
                  className="text-button"
                  onClick={() => selectTab("Products")}
                >
                  View all products →
                </button>
              </div>

              {displayedProducts.length > 0 ? (
                <div className="product-grid">
                  {(activeTab === "Overview"
                    ? displayedProducts.slice(0, 4)
                    : displayedProducts
                  ).map(renderProductCard)}
                </div>
              ) : (
                <div className="empty-state compact-empty">
                  <div className="empty-illustration">
                    {activeTab === "Wishlist" ? "♡" : "⌕"}
                  </div>
                  <h2>
                    {activeTab === "Wishlist"
                      ? "No favorites saved yet"
                      : "No products found"}
                  </h2>
                  <p>
                    {activeTab === "Wishlist"
                      ? "Tap the heart on a product to save it here."
                      : "Try searching for another product or category."}
                  </p>
                  {activeTab === "Wishlist" && (
                    <button
                      className="login-button empty-action"
                      onClick={() => selectTab("Products")}
                    >
                      Explore products →
                    </button>
                  )}
                </div>
              )}
            </section>
          )}

          <footer className="dashboard-footer">
            <span>© 2026 ShopLite</span>
            <span>Made for your everyday discoveries ✦</span>
          </footer>
        </div>
      </main>

      {notice && <div className="toast-message">✓ {notice}</div>}

      {cartOpen && (
        <div className="drawer-overlay" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Shopping cart"
          >
            <div className="drawer-header">
              <div>
                <span className="eyebrow">YOUR BAG</span>
                <h2>Shopping cart ({cartCount})</h2>
              </div>
              <button
                className="drawer-close"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="drawer-items">
              {cart.length === 0 ? (
                <div className="drawer-empty">
                  <span>🛍️</span>
                  <h3>Your bag is empty</h3>
                  <p>Start exploring and add something you love.</p>
                  <button
                    className="login-button"
                    onClick={() => {
                      setCartOpen(false);
                      selectTab("Products");
                    }}
                  >
                    Explore products
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="drawer-product" key={item.id}>
                    <div className={`drawer-product-art ${item.color}`}>
                      {item.emoji}
                    </div>
                    <div className="drawer-product-info">
                      <strong>{item.name}</strong>
                      <span>{formatPrice(item.price)}</span>
                      <div className="quantity-control">
                        <button
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <strong className="line-total">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-bottom">
                <div className="drawer-total">
                  <span>Total</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <button
                  className="login-button"
                  onClick={() =>
                    setNotice(
                      "Demo only — checkout will be connected later."
                    )
                  }
                >
                  Continue to checkout →
                </button>
                <p>Demo cart only. No real order or payment is created.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
