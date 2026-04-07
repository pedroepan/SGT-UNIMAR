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

function buildCedula8(seedValue, teamIndex, playerIndex, offset = 0) {
  const numericSeed = Number(String(seedValue).replace(/\D/g, '').slice(-8)) || 10000000;
  const value = numericSeed + offset + teamIndex * 100 + playerIndex;
  return String(value).slice(-8).padStart(8, '0');
}

async function seedMore() {
  console.log('Creando torneo de Futsala...');

  const getOrCreateTournament = async (nombre, disciplina) => {
    const { data: existente, error: findErr } = await supabase
      .from('torneos')
      .select('id')
      .eq('nombre', nombre)
      .eq('disciplina', disciplina)
      .limit(1);

    if (findErr) {
      throw findErr;
    }

    if (existente && existente.length > 0) {
      return existente[0];
    }

    const { data: creado, error: createErr } = await supabase
      .from('torneos')
      .insert({
        nombre,
        disciplina,
        estado: 'active',
      })
      .select('id')
      .single();

    if (createErr || !creado) {
      throw createErr ?? new Error('No se pudo crear el torneo');
    }

    return creado;
  };

  const futsalTour = await getOrCreateTournament('Liga Universitaria de Futsala', 'Futsal');

  console.log('Creando torneo de Voleibol...');

  const volleyTour = await getOrCreateTournament('Copa Unimar de Voleibol', 'Voleibol');

  const futsalTeams = [
    { name: 'Relampagos FS', captain: 'Andres Ruiz', ci: 'V-90000001' },
    { name: 'Titanes del Tablon', captain: 'Mario Bros', ci: 'V-90000002' },
    { name: 'Margarita FS', captain: 'Luis Suarez', ci: 'V-90000003' },
    { name: 'Leones Futsal', captain: 'Miguel Cabrera', ci: 'V-90000004' }
  ];

  const volleyTeams = [
    { name: 'Rematadores Unimar', captain: 'Pedro Leon', ci: 'V-80000001' },
    { name: 'Halcones Volley', captain: 'Jesus Nava', ci: 'V-80000002' },
    { name: 'Spikers Azules', captain: 'Carlos Mata', ci: 'V-80000003' },
    { name: 'Bloqueo Supremo', captain: 'Fernando Paz', ci: 'V-80000004' }
  ];

  const insertTeams = async (teams, idTorneo, disciplineSeed) => {
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const t = teams[teamIndex];
      const { data: equipoCreado, error: equipoError } = await supabase
        .from('equipo')
        .insert({
          nombre: t.name,
          id_torneo: idTorneo,
        })
        .select('id')
        .single();

      if (equipoError || !equipoCreado) {
        console.error('Error en equipo', t.name, equipoError);
        continue;
      }

      const jugadores = [];
      for (let i = 1; i <= 7; i++) {
        const disciplineOffset = disciplineSeed === 'F' ? 0 : 10000;
        const cedula = buildCedula8(t.ci, teamIndex, i, disciplineOffset);
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
        .select('id');

      if (jugadoresError || !jugadoresCreados || jugadoresCreados.length === 0) {
        console.error('Error jugadores de', t.name, jugadoresError);
        continue;
      }

      const capitanJugadorId = jugadoresCreados[0].id;
      const { error: capitanError } = await supabase
        .from('equipo')
        .update({ id_capitan: capitanJugadorId })
        .eq('id', equipoCreado.id);

      if (capitanError) {
        console.error('Error asignando capitan de', t.name, capitanError);
        continue;
      }

      console.log(`Equipo ${t.name} y 7 jugadores creados con éxito.`);
    }
  };

  console.log('\nInsertando equipos de Futsala...');
  await insertTeams(futsalTeams, futsalTour.id, 'F');

  console.log('\nInsertando equipos de Voleibol...');
  await insertTeams(volleyTeams, volleyTour.id, 'V');

  console.log('\nProceso de Creacion Completo.');
}

seedMore();
