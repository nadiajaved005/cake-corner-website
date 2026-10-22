
import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  CakeSlice,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Pencil,
  X,
  LockKeyhole,
  LogOut,
  MessageCircle,
  ChefHat,
  ArrowRight,
  Cookie,
  Heart,
} from "lucide-react";
import { auth, db } from "./firebase";
import "./App.css";

// IMPORTANT: Replace this with your WhatsApp number.
// Pakistan example: 923001234567 (country code, no + or spaces).
const WHATSAPP_NUMBER = "923083222470";

const emptyForm = {
  name: "",
  category: "Cakes",
  price: "",
  description: "",
  imageUrl: "",
  available: true,
};


// Demo catalogue: fictional sample prices and external image URLs for testing.
const DEMO_PRODUCTS = [
  { name: 'Chocolate Fudge Cake', category: 'Cakes', price: 1800, description: 'Moist chocolate sponge with rich fudge frosting.', imageUrl: "https://images.unsplash.com/photo-1626263468007-a9e0cf83f1ac?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Red Velvet Cake', category: 'Cakes', price: 2200, description: 'Soft red velvet layers with creamy frosting.', imageUrl: "https://images.unsplash.com/photo-1663839331055-d0c9bcb2929f?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Vanilla Celebration Cake', category: 'Cakes', price: 1600, description: 'Classic vanilla sponge for sweet celebrations.', imageUrl: "https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Black Forest Cake', category: 'Cakes', price: 2100, description: 'Chocolate layers, whipped cream and cherry flavor.', imageUrl: "https://images.unsplash.com/photo-1622621746668-59fb299bc4d7?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Strawberry Cream Cake', category: 'Cakes', price: 2000, description: 'Vanilla sponge finished with strawberry cream.', imageUrl: "https://images.unsplash.com/photo-1716918178946-5922b4e8645d?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Lotus Biscoff Cake', category: 'Cakes', price: 2800, description: 'Caramel biscuit cream with a crunchy topping.', imageUrl: "https://images.unsplash.com/photo-1611497406092-4bc22c54b322?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Oreo Chocolate Cake', category: 'Cakes', price: 2400, description: 'Chocolate cake with cookies-and-cream frosting.', imageUrl: "https://images.unsplash.com/photo-1598839950984-034f6dc7b495?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Pineapple Cake', category: 'Cakes', price: 1700, description: 'Light cream cake with sweet pineapple flavor.', imageUrl: "https://images.unsplash.com/photo-1559622214-f8a9850965bb?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Coffee Walnut Cake', category: 'Cakes', price: 2300, description: 'Coffee cream and crunchy walnut pieces.', imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Mango Delight Cake', category: 'Cakes', price: 2100, description: 'Creamy mango-inspired seasonal treat.', imageUrl: "https://images.unsplash.com/photo-1678473289821-1818e3f82e9a?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Lemon Drizzle Cake', category: 'Cakes', price: 1500, description: 'A bright lemon-flavored cake with sweet glaze.', imageUrl: "https://images.unsplash.com/photo-1667761256081-ded820d68ef4?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Caramel Crunch Cake', category: 'Cakes', price: 2500, description: 'Creamy caramel layers with a crunchy finish.', imageUrl: "https://images.unsplash.com/photo-1693060236785-206a880f8573?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Butter Biscuits', category: 'Biscuits', price: 350, description: 'Classic buttery biscuits for tea time.', imageUrl: "https://images.unsplash.com/photo-1676049461491-b829147f32c4?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Chocolate Chip Cookies', category: 'Biscuits', price: 450, description: 'Golden cookies with chocolate chips.', imageUrl: "https://images.unsplash.com/photo-1551584277-a31a25e08fc8?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Coconut Biscuits', category: 'Biscuits', price: 380, description: 'Crisp coconut biscuits with a sweet aroma.', imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Jeera Biscuits', category: 'Biscuits', price: 300, description: 'Savory cumin biscuits, perfect with chai.', imageUrl: "https://images.unsplash.com/photo-1426869884541-df7117556757?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Almond Cookies', category: 'Biscuits', price: 500, description: 'Crunchy cookies with an almond-inspired flavor.', imageUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Shortbread Biscuits', category: 'Biscuits', price: 400, description: 'Tender, crumbly shortbread-style biscuits.', imageUrl: "https://images.unsplash.com/photo-1555526148-0fa555bb2e78?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Peanut Butter Cookies', category: 'Biscuits', price: 480, description: 'Soft cookies with a nutty flavor.', imageUrl: "https://images.unsplash.com/photo-1623246123320-0d6636755796?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Assorted Biscuit Box', category: 'Biscuits', price: 650, description: 'A sample box of assorted bakery biscuits.', imageUrl: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Chocolate Cupcake', category: 'Cupcakes', price: 250, description: 'Chocolate cupcake topped with smooth frosting.', imageUrl: "https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Vanilla Cupcake', category: 'Cupcakes', price: 220, description: 'Soft vanilla cupcake with buttercream.', imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Red Velvet Cupcake', category: 'Cupcakes', price: 280, description: 'Red velvet cupcake with creamy topping.', imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Sprinkle Cupcake', category: 'Cupcakes', price: 230, description: 'A cheerful cupcake with colorful sprinkles.', imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Fudgy Chocolate Brownies', category: 'Special', price: 300, description: 'Dense chocolate brownies with a fudgy center.', imageUrl: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Classic Cheesecake', category: 'Special', price: 650, description: 'Creamy cheesecake on a biscuit base.', imageUrl: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Glazed Donut', category: 'Special', price: 180, description: 'A soft donut finished with sweet glaze.', imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Butter Croissant', category: 'Special', price: 250, description: 'Flaky, buttery pastry for breakfast or tea.', imageUrl: "https://images.unsplash.com/photo-1551024506-0f3d1a7a6a8d?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Cinnamon Rolls', category: 'Special', price: 350, description: 'Soft cinnamon rolls with sweet icing.', imageUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Chocolate Éclair', category: 'Special', price: 280, description: 'Choux pastry filled with cream and chocolate.', imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80", available: true },
  { name: 'Mini Dessert Box', category: 'Special', price: 950, description: 'A sample box of bite-sized sweet treats.', imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", available: true },
];

const money = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(error);
        setNotice("Could not load products. Check Firebase setup and rules.");
      }
    );
    return unsubscribe;
  }, []);

  const categories = ["All", "Cakes", "Biscuits", "Cupcakes", "Special"];

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;
      const matchesSearch = product.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch && product.available !== false;
    });
  }, [products, category, search]);

  const cartItems = products.filter((product) => cart[product.id] > 0);

  const cartCount = cartItems.reduce(
    (sum, product) => sum + cart[product.id],
    0
  );

  const total = cartItems.reduce(
    (sum, product) => sum + Number(product.price) * cart[product.id],
    0
  );

  const changeQuantity = (id, amount) => {
    setCart((current) => {
      const nextQuantity = (current[id] || 0) + amount;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[id];
      else next[id] = nextQuantity;
      return next;
    });
  };

  const openWhatsApp = () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      setNotice("Please enter your name and phone number.");
      return;
    }

    if (cartItems.length === 0) {
      setNotice("Your cart is empty.");
      return;
    }

    if (
      !/^\d{10,15}$/.test(WHATSAPP_NUMBER) ||
      WHATSAPP_NUMBER === "923001234567"
    ) {
      setNotice("First replace WHATSAPP_NUMBER in App.jsx with your number.");
      return;
    }

    const lines = cartItems.map(
      (product) =>
        `${product.name} x ${cart[product.id]} = ${money(
          Number(product.price) * cart[product.id]
        )}`
    );

    const message = [
      "Hello Cake Corner! I would like to place an order.",
      "",
      ...lines,
      "",
      `Total: ${money(total)}`,
      "",
      `Customer: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Address: ${customer.address || "Pickup / to be confirmed"}`,
      `Notes: ${customer.notes || "None"}`,
      "",
      "Please confirm availability and delivery charges.",
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      setNotice("Signed in successfully.");
    } catch {
      setLoginError("Login failed. Check your email and password.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAdminOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!user) return;

    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      setNotice("Enter a product name and a valid price.");
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: form.name.trim(),
        category: form.category,
        price,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        available: Boolean(form.available),
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        setNotice("Product updated.");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        setNotice("Product added.");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      console.error(error);
      setNotice("Could not save. Check your Firebase security rules.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      category: product.category || "Cakes",
      price: String(product.price ?? ""),
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      available: product.available !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeProduct = async (product) => {
    if (!user) return;
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    try {
      await deleteDoc(doc(db, "products", product.id));
      setNotice("Product deleted.");
      if (editingId === product.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (error) {
      console.error(error);
      setNotice("Could not delete this product.");
    }
  };


  const loadDemoProducts = async () => {
    if (!user || demoLoading) return;
    const confirmed = window.confirm(
      "Add or refresh the Cake Corner demo catalogue? Existing demo products will get the updated photos and sample details. Your non-demo products will not be changed. Sample prices are fictional."
    );
    if (!confirmed) return;

    setDemoLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const existingByName = new Map();
      snapshot.docs.forEach((item) => {
        const data = item.data();
        const key = String(data.name || "").trim().toLowerCase();
        if (key) existingByName.set(key, { id: item.id, ...data });
      });

      let addedCount = 0;
      let refreshedCount = 0;
      for (const product of DEMO_PRODUCTS) {
        const existing = existingByName.get(product.name.trim().toLowerCase());
        if (existing && existing.isDemo === true) {
          await updateDoc(doc(db, "products", existing.id), {
            ...product,
            updatedAt: serverTimestamp(),
            isDemo: true,
          });
          refreshedCount += 1;
        } else if (!existing) {
          await addDoc(collection(db, "products"), {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isDemo: true,
          });
          addedCount += 1;
        }
        // If a real product with this name exists, leave it untouched.
      }

      setNotice(
        `Demo catalogue updated: ${addedCount} added, ${refreshedCount} demo products refreshed. Your non-demo products were left unchanged.`
      );
    } catch (error) {
      console.error("Could not load demo products:", error);
      setNotice("Could not load demo products. Check that you are signed in as admin and your Firestore rules allow product creation.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="site-shell">
      <div className="announcement">
        Freshly baked with love <span>✦</span> Made for your sweetest moments
      </div>

      <header className="navbar">
        <a className="brand" href="#home" aria-label="Cake Corner home">
          <span className="brand-mark"><CakeSlice size={25} /></span>
          <span>
            <strong>Cake Corner</strong>
            <small>BAKED WITH LOVE</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#menu">Our menu</a>
          <a href="#story">Our story</a>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button admin-shortcut"
            onClick={() => setAdminOpen(!adminOpen)}
            aria-label="Admin login"
            title="Admin"
          >
            <LockKeyhole size={19} />
          </button>
          <button className="cart-button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={19} />
            <span>Cart</span>
            <b>{cartCount}</b>
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={17} />
          </button>
        </div>
      )}

      {adminOpen && (
        <section className="admin-panel">
          <div className="admin-heading">
            <div>
              <span className="eyebrow">BAKERY MANAGEMENT</span>
              <h2>{user ? "Product dashboard" : "Admin sign in"}</h2>
            </div>
            <button className="icon-button" onClick={() => setAdminOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {!authReady ? (
            <p>Checking your session…</p>
          ) : !user ? (
            <form className="admin-login" onSubmit={handleLogin}>
              <label>
                Admin email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {loginError && <p className="error-text">{loginError}</p>}
              <button className="primary-button" type="submit">
                Sign in securely <ArrowRight size={17} />
              </button>
            </form>
          ) : (
            <>
              <div className="admin-toolbar">
                <p>Signed in as {user.email}</p>
                <div className="form-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={loadDemoProducts}
                    disabled={demoLoading}
                  >
                    {demoLoading ? "Loading demo products…" : "Load demo products"}
                    <CakeSlice size={17} />
                  </button>
                  <button className="outline-button" onClick={handleLogout}>
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              </div>

              <form className="product-form" onSubmit={saveProduct}>
                <h3>{editingId ? "Edit product" : "Add a product"}</h3>
                <label>
                  Product name
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Chocolate fudge cake"
                    required
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {categories.filter((c) => c !== "All").map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price (PKR)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      required
                    />
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    rows="2"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Flavor, size, ingredients, etc."
                  />
                </label>

                <label>
                  Product image URL
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/cake.jpg"
                  />
                </label>

                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm({ ...form, available: e.target.checked })
                    }
                  />
                  Available to order
                </label>

                <div className="form-actions">
                  <button className="primary-button" disabled={saving}>
                    {saving
                      ? "Saving…"
                      : editingId
                      ? "Save changes"
                      : "Add product"}
                    <ArrowRight size={17} />
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => {
                        setEditingId(null);
                        setForm(emptyForm);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <h3 className="inventory-title">
                Inventory ({products.length})
              </h3>
              {products.map((product) => (
                <div className="inventory-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <small>
                      {product.category} · {money(product.price)}
                      {product.available === false ? " · Unavailable" : ""}
                    </small>
                  </div>
                  <div className="inventory-actions">
                    <button
                      className="icon-button"
                      onClick={() => startEditing(product)}
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-button danger-icon"
                      onClick={() => removeProduct(product)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span>✦</span> YOUR NEIGHBORHOOD BAKERY
            </div>
            <h1>A little sweetness<br />goes a <em>long way.</em></h1>
            <p>
              Beautiful cakes, buttery biscuits, and handmade treats
              baked to make your everyday moments extra special.
            </p>
            <div className="hero-buttons">
              <a className="primary-button" href="#menu">
                Explore our menu <ArrowRight size={18} />
              </a>
              <span className="handwritten">Made fresh, with love ♡</span>
            </div>
            <div className="hero-trust">
              <span><Heart size={16} /> Made with care</span>
              <span><ChefHat size={17} /> Freshly baked</span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"
              alt="Beautiful chocolate celebration cake"
            />
            <div className="hero-sticker">
              <span>BAKED</span>
              <strong>with love</strong>
              <span>EVERY DAY ✦</span>
            </div>
            <div className="hero-caption">
              <span>Our signature collection</span>
              <strong>Sweet moments, made memorable.</strong>
            </div>
          </div>
        </section>

        <section className="promise-strip">
          <div><span>01</span> Quality ingredients</div>
          <div><span>02</span> Made with love</div>
          <div><span>03</span> Treats for every occasion</div>
        </section>

        <section className="menu-section" id="menu">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A LITTLE SOMETHING SWEET</span>
              <h2>Fresh from our <em>oven.</em></h2>
              <p>Find your new favorite treat, baked just for you.</p>
            </div>
            <span className="menu-decoration"><Cookie size={36} /></span>
          </div>

          <div className="menu-tools">
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "category-tab active" : "category-tab"}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a treat..."
                aria-label="Search products"
              />
            </label>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="empty-products">
              <CakeSlice size={44} />
              <h3>Something sweet is coming!</h3>
              <p>
                {products.length === 0
                  ? "Our menu is being prepared. Please check back soon."
                  : "No products match your search. Try another category."}
              </p>
              {products.length === 0 && (
                <button
                  className="outline-button"
                  onClick={() => setAdminOpen(true)}
                >
                  Admin: add your first products
                </button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrap">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="image-placeholder">
                        {product.category === "Biscuits" ? (
                          <Cookie size={46} />
                        ) : (
                          <CakeSlice size={46} />
                        )}
                      </div>
                    )}
                    <span className="product-tag">{product.category}</span>
                    <button
                      className="quick-add"
                      onClick={() => changeQuantity(product.id, 1)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="product-details">
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.description || "A delicious bakery favorite."}</p>
                    </div>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <button
                        className="add-button"
                        onClick={() => changeQuantity(product.id, 1)}
                      >
                        Add to cart <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="story-section" id="story">
          <div className="story-icon"><Heart size={30} /></div>
          <div>
            <span className="eyebrow">A BAKERY WITH HEART</span>
            <h2>Made for sharing.<br /><em>Remembered for the taste.</em></h2>
            <p>
              At Cake Corner, we believe the best memories often come with
              something sweet. From everyday biscuits to celebration cakes,
              every treat deserves a little extra love.
            </p>
          </div>
          <a className="outline-button" href="#menu">
            Find your favorite <ArrowRight size={17} />
          </a>
        </section>

        <section className="contact-strip">
          <div>
            <span className="eyebrow">CRAVING SOMETHING DELICIOUS?</span>
            <h2>Your next favorite treat is just a message away.</h2>
          </div>
          <button
            className="whatsapp-button"
            onClick={() => {
              if (
                !/^\d{10,15}$/.test(WHATSAPP_NUMBER) ||
                WHATSAPP_NUMBER === "923001234567"
              ) {
                setNotice("Replace WHATSAPP_NUMBER in App.jsx with your number first.");
                return;
              }
              window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Hello Cake Corner! I would like to ask about your menu."
                )}`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          >
            <MessageCircle size={19} /> Chat with us
          </button>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark"><CakeSlice size={23} /></span>
          <span><strong>Cake Corner</strong><small>BAKED WITH LOVE</small></span>
        </a>
        <p>Sweet treats. Beautiful moments. Made with love.</p>
        <span>© {new Date().getFullYear()} Cake Corner</span>
      </footer>

      {cartOpen && (
        <div className="modal-backdrop" onClick={() => setCartOpen(false)}>
          <section
            className="cart-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Your shopping cart"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">YOUR SWEET SELECTION</span>
                <h2>Your cart ({cartCount})</h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={42} />
                <h3>Your cart is waiting for treats.</h3>
                <p>Add something delicious from our menu.</p>
                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  Explore menu <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <div className="cart-item-info">
                        <strong>{product.name}</strong>
                        <span>{money(product.price)} each</span>
                        <b>{money(Number(product.price) * cart[product.id])}</b>
                      </div>
                      <div className="quantity-control">
                        <button
                          onClick={() => changeQuantity(product.id, -1)}
                          aria-label="Decrease quantity"
                        ><Minus size={15} /></button>
                        <span>{cart[product.id]}</span>
                        <button
                          onClick={() => changeQuantity(product.id, 1)}
                          aria-label="Increase quantity"
                        ><Plus size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Subtotal</span><strong>{money(total)}</strong>
                </div>
                <p className="delivery-note">
                  Delivery charges, availability and final details are confirmed on WhatsApp.
                </p>
                <button
                  className="whatsapp-button full-button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                >
                  Continue to order <MessageCircle size={18} />
                </button>
              </>
            )}
          </section>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)}>
          <section
            className="cart-modal checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">ALMOST THERE</span>
                <h2>Where should we send your order?</h2>
              </div>
              <button className="icon-button" onClick={() => setCheckoutOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <form
              className="checkout-form"
              onSubmit={(e) => {
                e.preventDefault();
                openWhatsApp();
              }}
            >
              <label>
                Your name *
                <input
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Phone number *
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Delivery address (optional)
                <textarea
                  rows="2"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                />
              </label>
              <label>
                Cake message or special instructions (optional)
                <textarea
                  rows="2"
                  value={customer.notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, notes: e.target.value })
                  }
                  placeholder="Birthday message, preferred date, flavor..."
                />
              </label>
              <div className="checkout-total">
                <span>Order subtotal</span><strong>{money(total)}</strong>
              </div>
              <button className="whatsapp-button full-button" type="submit">
                Send order on WhatsApp <MessageCircle size={18} />
              </button>
              <p className="privacy-note">
                Your order is sent to WhatsApp for confirmation. Payment is not collected on this website.
              </p>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
