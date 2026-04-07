import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

function readEnvValue(key) {
  const text = fs.readFileSync('.env', 'utf8');
  const line = text
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${key}=`));
  return line ? line.slice(key.length + 1).trim() : '';
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || readEnvValue('VITE_SUPABASE_URL');
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || readEnvValue('VITE_SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function buildCedula8(seedValue, teamIndex, playerIndex) {
  const numericSeed = Number(String(seedValue).replace(/\D/g, '').slice(-8)) || 10000000;
  const value = numericSeed + teamIndex * 100 + playerIndex;
  return String(value).slice(-8).padStart(8, '0');
}

async function seed() {
  console.log('Obteniendo torneo activo...');
  const { data: torneos, error: torneoError } = await supabase
    .from('torneos')
    .select('id')
    .eq('estado', 'active')
    .limit(1);

  if (torneoError || !torneos || torneos.length === 0) {
      console.log('Error obteniendo torneo', torneoError);
      return;
  }

  const idTorneo = torneos[0].id;

  const newTeams = [
    { name: 'Los Galacticos FC', captain: 'Carlos Perez', ci: 'V-10000001' },
    { name: 'Real Margarita', captain: 'Luis Gomez', ci: 'V-20000001' },
    { name: 'Deportivo Unimar', captain: 'Jose Silva', ci: 'V-30000001' }
  ];

  console.log('Insertando equipos...');
  for (let teamIndex = 0; teamIndex < newTeams.length; teamIndex++) {
    const t = newTeams[teamIndex];
    const { data: equipoCreado, error: equipoError } = await supabase
      .from('equipo')
      .insert({
        nombre: t.name,
        id_torneo: idTorneo,
      })
      .select('id')
      .single();

    if (equipoError || !equipoCreado) {
      console.error('Error insertando el equipo', t.name, equipoError);
      continue;
    }

    const jugadores = [];
    for (let i = 1; i <= 7; i++) {
      const cedula = buildCedula8(t.ci, teamIndex, i);
      const nombreJugador = i === 1 ? t.captain : `Jugador ${i} de ${t.name}`;

      const { data: usuarioJugador, error: usuarioJugadorError } = await supabase
        .from('usuarios')
        .insert({
          nombre: nombreJugador,
          correo: `${nombreJugador.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}.${i}@unimar.test`,
          cedula,
          password: 'temporal123',
          rol: i === 1 ? 'capitan' : 'jugador',
        })
        .select('id')
        .single();

      if (usuarioJugadorError || !usuarioJugador) {
        console.error('Error creando usuario jugador para', t.name, usuarioJugadorError);
        continue;
      }

      jugadores.push({
        id_usuario: usuarioJugador.id,
        id_equipo: equipoCreado.id,
      });
    }

    const { data: jugadoresCreados, error: jugadoresError } = await supabase
      .from('jugadores')
      .insert(jugadores)
      .select('id, id_usuario');

    if (jugadoresError || !jugadoresCreados || jugadoresCreados.length === 0) {
      console.error('Error insertando jugadores para', t.name, jugadoresError);
      continue;
    }

    const capitanJugador = jugadoresCreados.find((_, index) => index === 0);
    if (capitanJugador) {
      const { error: updateError } = await supabase
        .from('equipo')
        .update({ id_capitan: capitanJugador.id })
        .eq('id', equipoCreado.id);

      if (updateError) {
        console.error('Error asignando capitán en equipo', t.name, updateError);
      }
    }

    console.log(`Equipo ${t.name} insertado con éxito junto a sus 7 jugadores.`);
  }

  console.log('Inserción completada.');
}
seed();
