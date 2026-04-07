import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type User = {
  id: string;
  name?: string;
  email: string;
  rol: 'administrador' | 'jugador';
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    cedula: string,
    rol: 'administrador' | 'jugador',
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'sgt_unimar_session_user';

type UsuarioRow = {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
};

function normalizeRole(role: unknown): 'administrador' | 'jugador' {
  return role === 'administrador' ? 'administrador' : 'jugador';
}

function mapUsuarioRow(row: UsuarioRow | null): User | null {
  if (!row) return null;

  return {
    id: String(row.id),
    name: row.nombre,
    email: row.correo,
    rol: normalizeRole(row.rol),
  };
}

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as User;
    return {
      id: String(parsed.id),
      name: parsed.name,
      email: parsed.email,
      rol: normalizeRole(parsed.rol),
    };
  } catch (error) {
    console.error('[auth] error loading local session', error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const storedUser = readStoredUser();

    if (active) {
      setUser(storedUser);
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const correo = email.trim();
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, rol')
      .eq('correo', correo)
      .eq('password', password)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    const mappedUser = mapUsuarioRow((data as UsuarioRow | null) ?? null);
    if (!mappedUser) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mappedUser));
    }

    setUser(mappedUser);
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    cedula: string,
    rol: 'administrador' | 'jugador',
  ) => {
    const correo = email.trim();

    if (!/^\d{8}$/.test(cedula)) {
      throw new Error('La cédula debe tener exactamente 8 dígitos.');
    }

    const { data: existingUser, error: existingError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('correo', correo)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingUser) {
      throw new Error('Ya existe un usuario con ese correo.');
    }

    const { data: usuarioCreado, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        nombre: name,
        correo,
        cedula,
        password,
        rol,
      })
      .select('id, nombre, correo, rol')
      .single();

    if (usuarioError || !usuarioCreado) {
      throw new Error(`No se pudo crear el registro en usuarios: ${usuarioError?.message ?? 'error desconocido'}`);
    }

    if (rol === 'jugador') {
      const { error: jugadorError } = await supabase
        .from('jugadores')
        .insert({
          id_usuario: usuarioCreado.id,
          id_equipo: null,
        });

      if (jugadorError) {
        throw new Error(`Se creó el usuario pero no se pudo registrar como jugador: ${jugadorError.message}`);
      }
    }

    const mappedUser = mapUsuarioRow(usuarioCreado as UsuarioRow);
    if (mappedUser) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mappedUser));
      }
      setUser(mappedUser);
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
