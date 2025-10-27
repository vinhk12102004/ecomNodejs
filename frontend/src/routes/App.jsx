import { Routes, Route, Link } from "react-router-dom";
import HomePage from "../screens/HomePage.jsx";
import ProductDetail from "../screens/ProductDetail.jsx";

export default function App(){
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="font-semibold text-lg">💻 Ecom Laptop</Link>
          <nav className="text-sm text-slate-600">Made with React + Vite</nav>
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
        </Routes>
      </main>
      <footer className="border-t py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Ecom Laptop
      </footer>
    </div>
  );
}

