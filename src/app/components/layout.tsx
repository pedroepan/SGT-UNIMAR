import { Outlet, Link, useLocation } from "react-router";
import { Trophy, Calendar, Users, Menu } from "lucide-react";
import { useState } from "react";
import { Toaster } from "./ui/sonner";
import { useAuth } from "../context/auth-context";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Trophy },
    { path: "/fixtures", label: "Fixtures", icon: Calendar },
    { path: "/registro", label: "Inscribir Equipo", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8" />
              <div>
                <h1 className="text-lg leading-tight">SGT-Unimar</h1>
                <p className="text-xs opacity-90">Sistema de Gestión de Torneos</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Auth area */}
              <div className="ml-4">
                {/* show login/signup when not authenticated, otherwise show user and logout */}
                <AuthArea />
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="px-4">
                <AuthArea mobile />
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">© 2026 Universidad de Margarita - Todos los derechos reservados</p>
        </div>
      </footer>
      
      <Toaster position="top-right" />
    </div>
  );
}

function AuthArea({ mobile }: { mobile?: boolean }) {
  const { user, isAuthenticated, signOut } = useAuth();
  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${mobile ? 'flex-col' : ''}`}>
        <Link to="/login" className="px-3 py-1 rounded hover:bg-white/10">Iniciar</Link>
        <Link to="/signup" className="px-3 py-1 rounded bg-white/10">Crear cuenta</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{user?.name ?? user?.email}</span>
      <button onClick={signOut} className="px-3 py-1 rounded hover:bg-white/10">Cerrar sesión</button>
    </div>
  );
}