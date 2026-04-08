import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Trophy, Calendar, Users, Menu, ChevronDown, LogOut, UserRound, Image as ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "./ui/sonner";
import { useAuth } from "../context/auth-context";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTournament } from "../context/tournament-context";
import { PlayerProfileDialog } from "./player-profile-dialog";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    ...(user?.rol === "administrador" ? [{ path: "/dashboard", label: "Dashboard", icon: Trophy }] : []),
    { path: "/fixtures", label: "Fixtures", icon: Calendar },
    { path: "/galeria", label: "Galería", icon: ImageIcon },
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
  const { getUserTeams, getUserTournaments } = useTournament();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const userTeams = user ? getUserTeams(user.id) : [];
  const userTournaments = user ? getUserTournaments(user.id) : [];
  const isPlayer = user?.rol === "jugador";
  const canOpenProfile = isAuthenticated;
  const initials = (user?.name ?? user?.email ?? "U")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${mobile ? "flex-col" : ""}`}>
        <Link to="/login" className="px-3 py-1 rounded hover:bg-white/10">
          Iniciar
        </Link>
        <Link to="/signup" className="px-3 py-1 rounded bg-white/10">
          Crear cuenta
        </Link>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative inline-flex w-full justify-end">
      <Button
        type="button"
        variant="ghost"
        size="default"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
        className={`cursor-pointer gap-2 rounded-lg px-4 py-2 text-base text-primary-foreground hover:bg-white/10 hover:text-white ${
          mobile ? "w-full justify-between px-3 py-3" : ""
        }`}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={user?.avatarUrl} alt={user?.name ?? "Usuario"} />
            <AvatarFallback className="bg-white/10 text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{user?.name ?? user?.email}</span>
        </span>
        <ChevronDown className={`h-4 w-4 opacity-80 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </Button>

      {menuOpen && (
        <div
          role="menu"
          aria-label="Opciones de usuario"
          className={`absolute top-full z-[60] mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-2xl ${
            mobile ? "left-0" : "right-0"
          }`}
        >
          <div className="px-3 py-2">
            <div className="flex flex-col space-y-0.5">
              <span className="font-medium">{user?.name ?? "Usuario"}</span>
              <span className="text-xs font-normal text-slate-500">{user?.email}</span>
            </div>
          </div>
          <div className="my-1 h-px bg-slate-200" />
          {canOpenProfile && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
            >
              <UserRound className="h-4 w-4" />
              Mi perfil
            </button>
          )}
          {isPlayer && (
            <div className="px-3 pb-2 text-xs text-slate-500">
              <div>{userTeams.length} equipo{userTeams.length === 1 ? "" : "s"} inscrito{userTeams.length === 1 ? "" : "s"}</div>
              <div>{userTournaments.length} torneo{userTournaments.length === 1 ? "" : "s"} en participación</div>
            </div>
          )}
          {isPlayer && <div className="my-1 h-px bg-slate-200" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              void handleSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 transition-colors hover:bg-rose-50 focus:bg-rose-50 focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      )}

      {canOpenProfile && <PlayerProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />}
    </div>
  );
}