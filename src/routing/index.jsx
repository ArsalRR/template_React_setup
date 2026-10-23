import { Component, Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/layout/MainLayout.jsx";

const APP_NAME = import.meta.env.VITE_APP_NAME || "NamaApp";
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ padding: 24, fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Halaman gagal ditampilkan
        </h1>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            color: "#b91c1c",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {String(this.state.error?.stack || this.state.error)}
        </pre>
      </div>
    );
  }
}
function RouteBoundary({ children }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}
function PageWithTitle({ title, children }) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);

  return children;
}
const modules = import.meta.glob([
  "/src/pages/**/*.jsx",
  "!/src/pages/**/components/**",
  "!/src/pages/**/_*.jsx",
]);
function fileToPath(file) {
  const path = file
    .replace("/src/pages", "")
    .replace(/\.jsx$/, "")
    .replace(/\/index$/, "")
    .split("/")
    .map((seg) =>
      /^\[.+\]$/.test(seg) ? `:${seg.slice(1, -1)}` : seg.toLowerCase()
    )
    .join("/");

  return path || "/";
}
function defaultTitle(path) {
  return path
    .split("/")
    .filter((s) => s && !s.startsWith(":"))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const PAGES = Object.entries(modules).map(([file, loader]) => {
  const path = fileToPath(file);

  const Element = lazy(async () => {
    const mod = await loader();

    if (typeof mod.default !== "function") {
      throw new Error(`${file} harus punya "export default" berupa komponen.`);
    }

    const Page = mod.default;
    const title = mod.title ?? defaultTitle(path);
    const withLayout = mod.layout !== false; // export const layout = false -> tanpa MainLayout

    return {
      default: function RoutedPage() {
        return (
          <PageWithTitle title={title}>
            {withLayout ? (
              <MainLayout>
                <Page />
              </MainLayout>
            ) : (
              <Page />
            )}
          </PageWithTitle>
        );
      },
    };
  });

  return { path, Element };
});

// Cegah redirect tanpa akhir kalau /dashboard belum ada
const HAS_DASHBOARD = PAGES.some((p) => p.path === "/dashboard");

export default function AppRoutes() {
  return (
    <RouteBoundary>
      <Suspense fallback={<div style={{ padding: 24 }}>Memuat...</div>}>
        <Routes>
          {PAGES.map(({ path, Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}

          <Route
            path="*"
            element={
              HAS_DASHBOARD ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <div style={{ padding: 24 }}>
                  Halaman tidak ditemukan. Pastikan ada
                  src/pages/dashboard/index.jsx
                </div>
              )
            }
          />
        </Routes>
      </Suspense>
    </RouteBoundary>
  );
}