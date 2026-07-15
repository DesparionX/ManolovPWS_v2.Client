import { useEffect, useState, useSyncExternalStore } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authStore } from "./authStore";
import { refreshAccessToken } from "../api/httpClient";

export function RequireAuth() {
  const isAuthenticated = useSyncExternalStore(
    authStore.subscribe,
    authStore.isAuthenticated,
  );
  const [checkedRefresh, setCheckedRefresh] = useState(isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) return;
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setCheckedRefresh(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  if (isAuthenticated) return <Outlet />;
  if (!checkedRefresh) return null;
  return <Navigate to="/" replace />;
}
