import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://xjmalmvkwzxpieuauonz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbWFsbXZrd3p4cGlldWF1b256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc2NDUsImV4cCI6MjA4OTI5MzY0NX0.SugKTUSUCuQSS7x5l7WEw-pD3oOSvf2FSCfUu2Ve-Uo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  let output = "Verificando conexión a Supabase remota...\n\n";
  
  // Checking teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*, players(*)');
    
  if (teamsError) {
    output += `Error al obtener equipos: ${teamsError.message}\n`;
    fs.writeFileSync('db_output.txt', output);
    return;
  }
  
  output += `¡Conexión OK! Se encontraron ${teams.length} equipos en la base de datos original.\n`;
  
  const chamos = teams.find(t => t.name.toLowerCase().includes('chamos fc'));
  if (chamos) {
    output += `\n✅ El equipo 'chamos fc s' está correctamente registrado en la base de datos.\n`;
    output += `Nombre del equipo: ${chamos.name}\n`;
    output += `Nombre del Capitán: ${chamos.captain_name}\n`;
    output += `Cédula del Capitán: ${chamos.captain_ci}\n`;
    output += `Estado de aprobación: ${chamos.status}\n`;
    
    output += `\nVerificando jugadores de ${chamos.name}...\n`;
    output += `Cantidad de jugadores guardados: ${chamos.players?.length}\n`;
    if (chamos.players?.length === 7) {
      output += `✅ ¡Los 7 jugadores fueron insertados correctamente en la tabla 'players'!\n`;
      chamos.players.forEach((p, i) => {
          output += `   Jugador ${i+1}: ${p.name} (CI: ${p.ci})\n`;
      });
    } else {
      output += `⚠️ Advertencia: Número distinto a 7 jugadores encontrados.\n`;
    }
  } else {
    output += `\nAún no se ha guardado 'chamos fc s' en remoto o el nombre es diferente.\n`;
  }
  fs.writeFileSync('db_results.txt', output);
  console.log("Listo, escrito a db_results.txt");
}

testConnection();
