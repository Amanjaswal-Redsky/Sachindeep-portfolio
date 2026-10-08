import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

const Welcome = lazy(() => import("./pages/Welcome/Welcome"));
const Home = lazy(() => import("./pages/Home/Home"));
const AdminLogin = lazy(() => import("./pages/Admin/Admin").then(({ AdminLogin: Page }) => ({ default: Page })));
const AdminDashboard = lazy(() => import("./pages/Admin/Admin").then(({ AdminDashboard: Page }) => ({ default: Page })));

export default function App() {
  const [theme, setTheme] = useState("dark");
  const location = useLocation();
  const [initialLocation] = useState(() => ({
    key: location.key,
    shouldRedirectHomeRefresh: location.pathname === "/home" &&
      performance.getEntriesByType("navigation")[0]?.type === "reload",
  }));
  const redirectHomeRefresh = initialLocation.shouldRedirectHomeRefresh &&
    location.key === initialLocation.key;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <Suspense fallback={<div className="app-loading-fallback" aria-hidden="true" />}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route
            path="/home"
            element={redirectHomeRefresh
              ? <Navigate to="/" replace />
              : <Home theme={theme} onToggleTheme={toggleTheme} />}
          />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </div>
  );
}