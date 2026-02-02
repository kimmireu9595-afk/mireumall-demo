import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/admin/AdminPage";
import ProductCreatePage from "./pages/admin/ProductCreatePage";
import ProductListPage from "./pages/admin/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";

function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "https://mireumall-demo-production.up.railway.app",
    []
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    const cleanedToken = token.replace(/"/g, "");
    fetch(`${apiBase}/api/users/me`, {
      headers: { Authorization: `Bearer ${cleanedToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.removeItem("token");
          setUser(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, [apiBase]);

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<ProductListPage />} />
        <Route path="/admin/products/new" element={<ProductCreatePage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
