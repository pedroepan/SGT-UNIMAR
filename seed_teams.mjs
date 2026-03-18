import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xjmalmvkwzxpieuauonz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbWFsbXZrd3p4cGlldWF1b256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc2NDUsImV4cCI6MjA4OTI5MzY0NX0.SugKTUSUCuQSS7x5l7WEw-pD3oOSvf2FSCfUu2Ve-Uo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log("Obteniendo torneo activo...");
  const { data: tournaments, error: tourError } = await supabase.from('tournaments').select('*').limit(1);
  if (tourError || !tournaments || tournaments.length === 0) {
      console.log("Error obteniendo torneo", tourError);
      return;
  }
  
  const tournamentId = tournaments[0].id;
  
  const newTeams = [
    { name: "Los Galacticos FC", captain: "Carlos Perez", ci: "V-10000001" },
    { name: "Real Margarita", captain: "Luis Gomez", ci: "V-20000001" },
    { name: "Deportivo Unimar", captain: "Jose Silva", ci: "V-30000001" }
  ];

  console.log("Insertando equipos...");
  for (const t of newTeams) {
    const { data: team, error } = await supabase.from('teams').insert({
      tournament_id: tournamentId,
      name: t.name,
      captain_name: t.captain,
      captain_ci: t.ci,
      captain_phone: "0412-0000000",
      captain_email: "test@test.com",
      status: "pending"
    }).select().single();
    
    if (error) {
      console.error("Error insertando el equipo", t.name, error);
      continue;
    }
    
    // Add 7 players
    const players = [];
    for(let i=1; i<=7; i++) {
       players.push({
         team_id: team.id,
         name: `Jugador ${i} de ${t.name}`,
         ci: `V-${i}${i}${t.ci.slice(4)}`
       });
    }
    
    const { error: playersError } = await supabase.from('players').insert(players);
    if(playersError) {
      console.error("Error insertando jugadores para", t.name, playersError);
    } else {
      console.log(`✅ Equipo ${t.name} insertado con éxito junto a sus 7 jugadores.`);
    }
  }
  
  console.log("Inserción completada.");
}
seed();
