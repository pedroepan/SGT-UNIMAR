import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-primary-foreground">
      <div className="w-full max-w-lg mx-auto bg-card text-card-foreground rounded-lg shadow p-8">
        <h2 className="text-2xl font-medium mb-2">Crear cuenta</h2>
        <p className="text-sm text-muted-foreground mb-6">Regístrate para empezar a gestionar torneos</p>

        <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
        </div>

        <div>
          <label className="block mb-1">Correo</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>

        <div>
          <label className="block mb-1">Contraseña</label>
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>

        <div className="flex items-center justify-between">
          <Button type="submit" variant="default" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</Button>
          <Link to="/login" className="text-sm text-primary underline">Ya tengo cuenta</Link>
        </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
