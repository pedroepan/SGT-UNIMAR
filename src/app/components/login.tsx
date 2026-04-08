import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center bg-gradient-to-br from-blue-700 via-primary to-sky-900 px-4 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary">SGT Unimar</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-600">Accede a tu cuenta para gestionar torneos.</p>
          </div>

          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Correo</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                required
                placeholder="tu@correo.com"
                className="bg-slate-100 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="Ingresa tu contraseña"
                className="bg-slate-100 border-slate-200"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Button type="submit" variant="default" disabled={loading} className="min-w-32">
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Link to="/signup" className="text-sm font-medium text-primary hover:underline">
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/JUEGOS-UNIVERSITARIOS-UNIMAR-2018-EL-VALLE-1.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/65 to-primary/45" />
        <div className="relative flex h-full items-end p-10">
          <div className="max-w-lg space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Universidad de Margarita</p>
            <h3 className="text-4xl font-semibold leading-tight">Gestiona equipos, torneos y partidos desde un solo lugar.</h3>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Login;
