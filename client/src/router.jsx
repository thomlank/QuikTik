import { createBrowserRouter, Navigate } from "react-router-dom";
import { authUtils, userApi } from "./utils/DjangoApiUtil";

import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import TicketsPage from "./pages/TicketsPage";
import UsersPage from "./pages/UsersPage";
import TeamsPage from "./pages/TeamsPage";
import CategoriesPage from "./pages/CategoriesPage";

const dashboardLoader = async () => {
  if (!authUtils.isAuthenticated()) {
    return null;
  }

  try {
    const user = await userApi.getCurrent();
    return { user };
  } catch (err) {
    console.error("Failed to load user:", err);
    // Don't call logout here - just clear token and redirect
    localStorage.removeItem("token");
    window.location.href = "/";
    return null;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: authUtils.isAuthenticated() ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <AuthPage />
    ),
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    loader: dashboardLoader,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "tickets",
        element: <TicketsPage />,
      },
      {
        path: "teams",
        element: <TeamsPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;