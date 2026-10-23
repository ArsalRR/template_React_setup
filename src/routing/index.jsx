import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layout/MainLayout.jsx";
import DashboardPage from "@/pages/Dasboard/dasboard";


const APP_NAME = import.meta.env.VITE_APP_NAME || "NamaApp";

function PageWithTitle({ title, children }) {
  useEffect(() => {
    document.title = title ? `${title} | ${APP_NAME}` : APP_NAME;
  }, [title]);

  return children;
}

// Halaman dengan MainLayout
const PAGES = [
  { path: "/dashboard", element: DashboardPage, title: "Dashboard" },
];

// Halaman tanpa MainLayout (cetak, preview, dsb)
const STANDALONE_PAGES = [];

export default function AppRoutes() {
  return (
    <Routes>
      {PAGES.map(({ path, element: Page, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PageWithTitle title={title}>
              <MainLayout>
                <Page />
              </MainLayout>
            </PageWithTitle>
          }
        />
      ))}

      {STANDALONE_PAGES.map(({ path, element: Page, title }) => (
        <Route
          key={path}
          path={path}
          element={
            <PageWithTitle title={title}>
              <Page />
            </PageWithTitle>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}