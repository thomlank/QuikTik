import { useState } from "react";
import { Navigate, Outlet, useLoaderData } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { userApi } from "../utils/DjangoApiUtil";

export default function DashboardLayout() {
  const loaderData = useLoaderData();
  const [user, setUser] = useState(loaderData?.user || null);

  if (!loaderData || !loaderData.user) {
    return <Navigate to="/" replace />;
  }

  const refreshUser = async () => {
    try {
      const updatedUser = await userApi.getCurrent();
      setUser(updatedUser);
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar user={user} />
      <main className="main-content">
        <Outlet context={{ user, refreshUser }} />
      </main>
    </div>
  );
}