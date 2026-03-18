import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xjmalmvkwzxpieuauonz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbWFsbXZrd3p4cGlldWF1b256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTc2NDUsImV4cCI6MjA4OTI5MzY0NX0.SugKTUSUCuQSS7x5l7WEw-pD3oOSvf2FSCfUu2Ve-Uo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seedMore() {
  console.log("Creando torneo de Futsala...");
  
  const { data: futsalTour, error: err1 } = await supabase.from('tournaments').insert({
    name: "Liga Universitaria de Futsala",
    sport: "Futsal",
    start_date: "2026-04-01",
    status: "active"
  }).select().single();
  
  if (err1) {
    console.error("Error creando torneo futsala:", err1);
    return;
  }
  
  console.log("Creando torneo de Voleibol...");
  
  const { data: volleyTour, error: err2 } = await supabase.from('tournaments').insert({
    name: "Copa Unimar de Voleibol",
    sport: "Voleibol",
    start_date: "2026-04-05",
    status: "active"
  }).select().single();
  
  if (err2) {
    console.error("Error creando torneo voleibol:", err2);
    return;
  }
  
  const futsalTeams = [
    { name: "Relámpagos FS", captain: "Andres Ruiz", ci: "V-90000001" },
    { name: "Titanes del Tablon", captain: "Mario Bros", ci: "V-90000002" },
    { name: "Margarita FS", captain: "Luis Suarez", ci: "V-90000003" },
    { name: "Leones Futsal", captain: "Miguel Cabrera", ci: "V-90000004" }
  ];
  
  const volleyTeams = [
    { name: "Rematadores Unimar", captain: "Pedro Leon", ci: "V-80000001" },
    { name: "Halcones Volley", captain: "Jesus Nava", ci: "V-80000002" },
    { name: "Spikers Azules", captain: "Carlos Mata", ci: "V-80000003" },
    { name: "Bloqueo Supremo", captain: "Fernando Paz", ci: "V-80000004" }
  ];
  
  const insertTeams = async (teams, tId) => {
    for (const t of teams) {
      const { data: team, error: tErr } = await supabase.from('teams').insert({
        tournament_id: tId,
        name: t.name,
        captain_name: t.captain,
        captain_ci: t.ci,
        captain_phone: "0412-1234567",
        captain_email: "contacto@unimar.test",
        status: "pending"
      }).select().single();
      
      if (tErr) {
        console.error("Error en equipo", t.name, tErr);
        continue;
      }
      
      const players = [];
      for(let i=1; i<=7; i++) {
         players.push({
           team_id: team.id,
           name: `Jugador ${i} de ${t.name}`,
           ci: `V-${i}${i}${t.ci.slice(4)}`
         });
      }
      const { error: pErr } = await supabase.from('players').insert(players);
      if (pErr) console.error("Error jugadores de", t.name, pErr);
      else console.log(`✅ Equipo ${t.name} y 7 jugadores creados con éxito.`);
    }
  };

  console.log("\nInsertando equipos de Futsala...");
  await insertTeams(futsalTeams, futsalTour.id);

  console.log("\nInsertando equipos de Voleibol...");
  await insertTeams(volleyTeams, volleyTour.id);
  
  console.log("\n¡Proceso de Creación Completo!");
}

seedMore();
