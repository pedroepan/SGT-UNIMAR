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

async function testConnection() {
  let output = 'Verificando conexion a Supabase remota...\n\n';

  const { data: equipos, error: equiposError } = await supabase
    .from('equipo')
    .select('id, nombre, id_capitan, id_torneo')
    .limit(50);

  if (equiposError) {
    output += `Error al obtener equipos: ${equiposError.message}\n`;
    fs.writeFileSync('db_output.txt', output);
    return;
  }

  output += `Conexion OK. Se encontraron ${equipos.length} equipos en la base de datos.\n`;

  const equipo = equipos.find((t) => t.nombre?.toLowerCase().includes('chamos fc')) ?? equipos[0];
  if (equipo) {
    const { data: jugadores, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('id, id_usuario')
      .eq('id_equipo', equipo.id);

    if (jugadoresError) {
      output += `Error al obtener jugadores de ${equipo.nombre}: ${jugadoresError.message}\n`;
    } else {
      output += `\nEquipo revisado: ${equipo.nombre}\n`;
      output += `Cantidad de jugadores guardados: ${jugadores?.length ?? 0}\n`;

      if ((jugadores?.length ?? 0) >= 1) {
        const idsUsuarios = jugadores.map((j) => j.id_usuario);
        const { data: usuarios, error: usuariosError } = await supabase
          .from('usuarios')
          .select('id, nombre, cedula')
          .in('id', idsUsuarios);

        if (usuariosError) {
          output += `Error al obtener usuarios de jugadores: ${usuariosError.message}\n`;
        } else {
          output += 'Jugadores encontrados en usuarios:\n';
          usuarios.forEach((u, index) => {
            output += `   Jugador ${index + 1}: ${u.nombre} (CI: ${u.cedula})\n`;
          });
        }
      }

      if (equipo.id_capitan) {
        const { data: capitanJugador, error: capitanJugadorError } = await supabase
          .from('jugadores')
          .select('id, id_usuario')
          .eq('id', equipo.id_capitan)
          .single();

        if (capitanJugadorError) {
          output += `Error al obtener jugador capitan: ${capitanJugadorError.message}\n`;
        } else {
          const { data: capitanUsuario, error: capitanUsuarioError } = await supabase
            .from('usuarios')
            .select('nombre, cedula, correo')
            .eq('id', capitanJugador.id_usuario)
            .single();

          if (capitanUsuarioError) {
            output += `Error al obtener usuario capitan: ${capitanUsuarioError.message}\n`;
          } else {
            output += `Capitan del equipo: ${capitanUsuario.nombre} (${capitanUsuario.cedula})\n`;
            output += `Correo del capitan: ${capitanUsuario.correo}\n`;
          }
        }
      } else {
        output += 'El equipo no tiene id_capitan asignado.\n';
      }
    }
  } else {
    output += '\nNo se encontro ningun equipo para validar.\n';
  }

  const { data: torneos, error: torneosError } = await supabase
    .from('torneos')
    .select('id, nombre, disciplina, estado')
    .limit(10);

  if (torneosError) {
    output += `Error al obtener torneos: ${torneosError.message}\n`;
  } else {
    output += `\nTorneos encontrados: ${torneos.length}\n`;
    torneos.forEach((torneo) => {
      output += `- ${torneo.nombre} (${torneo.disciplina}) estado=${torneo.estado}\n`;
    });
  }

  const { count: fixturesCount, error: fixtureError } = await supabase
    .from('fixture')
    .select('id', { count: 'exact', head: true });

  if (fixtureError) {
    output += `\nNo se pudo contar fixture: ${fixtureError.message}\n`;
  } else {
    output += `\nPartidos en fixture: ${fixturesCount ?? 0}\n`;
  }

  fs.writeFileSync('db_results.txt', output);
  console.log('Listo, escrito a db_results.txt');
}

testConnection();
