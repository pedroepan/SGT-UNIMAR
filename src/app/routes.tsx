import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { Layout } from "./components/layout";
import { AdminDashboard } from "./components/admin-dashboard";
import { Fixture } from "./components/fixture";
import { Gallery } from "./components/gallery";
import { TeamRegistration } from "./components/team-registration";
import { NotFound } from "./components/not-found";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { useAuth } from "./context/auth-context";

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center">Cargando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={user?.rol === "administrador" ? "/dashboard" : "/fixtures"} replace />;
  }

  return <>{children}</>;
}

function AdminOnly() {
  const { user } = useAuth();
  if (user?.rol !== "administrador") {
    return <Navigate to="/fixtures" replace />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.rol === "administrador" ? "/dashboard" : "/fixtures"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: HomeRedirect },
      {
        Component: AdminOnly,
        children: [{ path: "dashboard", Component: AdminDashboard }],
      },
      { path: "fixtures", Component: Fixture },
      { path: "galeria", Component: Gallery },
      { path: "registro", Component: TeamRegistration },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/login",
    Component: () => (
      <PublicOnly>
        <Login />
      </PublicOnly>
    ),
  },
  {
    path: "/signup",
    Component: () => (
      <PublicOnly>
        <Signup />
      </PublicOnly>
    ),
  },
]);
