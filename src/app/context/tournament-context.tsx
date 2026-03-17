import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Player {
  name: string;
  ci: string;
}

export interface TeamRegistration {
  id: string;
  teamName: string;
  sport: string;
  captainName: string;
  captainCI: string;
  captainPhone: string;
  captainEmail: string;
  players: Player[];
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  sport: string;
  team1Id: string;
  team2Id: string;
  team1Name: string;
  team2Name: string;
  date: string;
  time: string;
  team1Score: number | null;
  team2Score: number | null;
  status: "scheduled" | "completed";
}

export interface Standing {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface Tournament {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  status: "active" | "completed" | "upcoming";
  teams: string[]; // IDs de equipos aprobados
}

interface TournamentContextType {
  tournaments: Tournament[];
  teamRegistrations: TeamRegistration[];
  approvedTeams: TeamRegistration[];
  matches: Match[];
  addTournament: (tournament: Omit<Tournament, "id" | "teams">) => void;
  addTeamRegistration: (team: Omit<TeamRegistration, "id" | "submittedDate" | "status">) => void;
  approveTeam: (teamId: string) => void;
  rejectTeam: (teamId: string) => void;
  addTeamToTournament: (tournamentId: string, teamId: string) => void;
  removeTeamFromTournament: (tournamentId: string, teamId: string) => void;
  updateMatchResult: (matchId: string, team1Score: number, team2Score: number) => void;
  getPendingTeams: () => TeamRegistration[];
  getApprovedTeamsBySport: (sport: string) => TeamRegistration[];
  getTournamentTeams: (tournamentId: string) => TeamRegistration[];
  getTournamentMatches: (tournamentId: string) => Match[];
  getTournamentStandings: (tournamentId: string) => Standing[];
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// Helper function to generate random time between 1pm and 5pm
function generateRandomTime(): string {
  const hours = [13, 14, 15, 16, 17]; // 1pm to 5pm
  const minutes = [0, 15, 30, 45];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Helper function to generate fixtures for a tournament
function generateFixtures(tournament: Tournament, teams: TeamRegistration[]): Match[] {
  const fixtures: Match[] = [];
  const startDate = new Date(tournament.startDate);
  
  // Round-robin: cada equipo juega contra todos los demás
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + fixtures.length * 2); // 2 días entre partidos
      
      fixtures.push({
        id: `match-${tournament.id}-${i}-${j}-${Date.now()}`,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        sport: tournament.sport,
        team1Id: teams[i].id,
        team2Id: teams[j].id,
        team1Name: teams[i].teamName,
        team2Name: teams[j].teamName,
        date: matchDate.toISOString().split('T')[0],
        time: generateRandomTime(),
        team1Score: null,
        team2Score: null,
        status: "scheduled",
      });
    }
  }
  
  return fixtures;
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: "1",
      name: "Fútbol Sala 2026",
      sport: "Fútbol Sala",
      startDate: "2026-03-01",
      status: "active",
      teams: ["demo-team-1", "demo-team-2", "demo-team-3"],
    },
    {
      id: "2",
      name: "Baloncesto Universitario",
      sport: "Baloncesto",
      startDate: "2026-03-05",
      status: "active",
      teams: [],
    },
    {
      id: "3",
      name: "Voleibol Copa Unimar",
      sport: "Voleibol",
      startDate: "2026-03-10",
      status: "active",
      teams: [],
    },
  ]);

  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>([
    // Demo approved teams for Fútbol Sala
    {
      id: "demo-team-1",
      teamName: "Relámpagos FC",
      sport: "Fútbol Sala",
      captainName: "Diego Martínez",
      captainCI: "V-20111222",
      captainPhone: "0414-5551111",
      captainEmail: "diego@ejemplo.com",
      players: [
        { name: "Diego Martínez", ci: "V-20111222" },
        { name: "Roberto Silva", ci: "V-20222333" },
        { name: "Fernando Castro", ci: "V-20333444" },
        { name: "Gabriel Ramos", ci: "V-20444555" },
        { name: "Daniel Torres", ci: "V-20555666" },
        { name: "Andrés Mora", ci: "V-20666777" },
        { name: "Pablo Ruiz", ci: "V-20777888" },
      ],
      submittedDate: "2026-02-10",
      status: "approved",
    },
    {
      id: "demo-team-2",
      teamName: "Halcones United",
      sport: "Fútbol Sala",
      captainName: "Ricardo Pérez",
      captainCI: "V-21111222",
      captainPhone: "0424-5552222",
      captainEmail: "ricardo@ejemplo.com",
      players: [
        { name: "Ricardo Pérez", ci: "V-21111222" },
        { name: "Eduardo López", ci: "V-21222333" },
        { name: "Jesús Morales", ci: "V-21333444" },
        { name: "Oscar Vargas", ci: "V-21444555" },
        { name: "Sergio Herrera", ci: "V-21555666" },
        { name: "Marco Núñez", ci: "V-21666777" },
      ],
      submittedDate: "2026-02-11",
      status: "approved",
    },
    {
      id: "demo-team-3",
      teamName: "Titanes FS",
      sport: "Fútbol Sala",
      captainName: "Manuel Gómez",
      captainCI: "V-22111222",
      captainPhone: "0412-5553333",
      captainEmail: "manuel@ejemplo.com",
      players: [
        { name: "Manuel Gómez", ci: "V-22111222" },
        { name: "Alejandro Díaz", ci: "V-22222333" },
        { name: "Raúl Sánchez", ci: "V-22333444" },
        { name: "Jorge Medina", ci: "V-22444555" },
        { name: "Alberto Rojas", ci: "V-22555666" },
        { name: "Víctor Ortiz", ci: "V-22666777" },
        { name: "Mario Vega", ci: "V-22777888" },
      ],
      submittedDate: "2026-02-12",
      status: "approved",
    },
    // Pending teams
    {
      id: "pending-1",
      teamName: "Los Tigres FC",
      sport: "Fútbol Sala",
      captainName: "Carlos Rodríguez",
      captainCI: "V-12345678",
      captainPhone: "0414-1234567",
      captainEmail: "carlos@ejemplo.com",
      players: [
        { name: "Carlos Rodríguez", ci: "V-12345678" },
        { name: "Juan Pérez", ci: "V-23456789" },
        { name: "Pedro González", ci: "V-34567890" },
        { name: "Luis Martínez", ci: "V-45678901" },
        { name: "Miguel Fernández", ci: "V-56789012" },
        { name: "José López", ci: "V-67890123" },
      ],
      submittedDate: "2026-02-15",
      status: "pending",
    },
    {
      id: "pending-2",
      teamName: "Águilas del Este",
      sport: "Baloncesto",
      captainName: "María González",
      captainCI: "V-11223344",
      captainPhone: "0424-9876543",
      captainEmail: "maria@ejemplo.com",
      players: [
        { name: "María González", ci: "V-11223344" },
        { name: "Ana Martínez", ci: "V-22334455" },
        { name: "Sofia Rodríguez", ci: "V-33445566" },
        { name: "Laura Pérez", ci: "V-44556677" },
        { name: "Carmen López", ci: "V-55667788" },
        { name: "Isabel García", ci: "V-66778899" },
      ],
      submittedDate: "2026-02-16",
      status: "pending",
    },
  ]);

  const [matches, setMatches] = useState<Match[]>([
    // Demo matches for Fútbol Sala tournament with some completed
    {
      id: "demo-match-1",
      tournamentId: "1",
      tournamentName: "Fútbol Sala 2026",
      sport: "Fútbol Sala",
      team1Id: "demo-team-1",
      team2Id: "demo-team-2",
      team1Name: "Relámpagos FC",
      team2Name: "Halcones United",
      date: "2026-03-01",
      time: "14:00",
      team1Score: 3,
      team2Score: 2,
      status: "completed",
    },
    {
      id: "demo-match-2",
      tournamentId: "1",
      tournamentName: "Fútbol Sala 2026",
      sport: "Fútbol Sala",
      team1Id: "demo-team-1",
      team2Id: "demo-team-3",
      team1Name: "Relámpagos FC",
      team2Name: "Titanes FS",
      date: "2026-03-03",
      time: "15:30",
      team1Score: 1,
      team2Score: 1,
      status: "completed",
    },
    {
      id: "demo-match-3",
      tournamentId: "1",
      tournamentName: "Fútbol Sala 2026",
      sport: "Fútbol Sala",
      team1Id: "demo-team-2",
      team2Id: "demo-team-3",
      team1Name: "Halcones United",
      team2Name: "Titanes FS",
      date: "2026-03-05",
      time: "16:00",
      team1Score: null,
      team2Score: null,
      status: "scheduled",
    },
  ]);

  const addTournament = (tournament: Omit<Tournament, "id" | "teams">) => {
    const newTournament: Tournament = {
      ...tournament,
      id: Date.now().toString(),
      teams: [],
    };
    setTournaments([...tournaments, newTournament]);
  };

  const addTeamRegistration = (team: Omit<TeamRegistration, "id" | "submittedDate" | "status">) => {
    const newTeam: TeamRegistration = {
      ...team,
      id: `team-${Date.now()}`,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setTeamRegistrations([...teamRegistrations, newTeam]);
  };

  const approveTeam = (teamId: string) => {
    setTeamRegistrations(
      teamRegistrations.map((team) =>
        team.id === teamId ? { ...team, status: "approved" as const } : team
      )
    );
  };

  const rejectTeam = (teamId: string) => {
    setTeamRegistrations(teamRegistrations.filter((team) => team.id !== teamId));
  };

  const addTeamToTournament = (tournamentId: string, teamId: string) => {
    setTournaments(
      tournaments.map((tournament) => {
        if (tournament.id === tournamentId) {
          const updatedTeams = [...tournament.teams, teamId];
          
          // Generate new fixtures when teams are added
          const tournamentTeams = teamRegistrations.filter((team) =>
            updatedTeams.includes(team.id)
          );
          
          if (tournamentTeams.length >= 2) {
            // Remove old fixtures for this tournament
            setMatches(prevMatches => prevMatches.filter(m => m.tournamentId !== tournamentId));
            
            // Generate new fixtures
            const newFixtures = generateFixtures(tournament, tournamentTeams);
            setMatches(prevMatches => [...prevMatches, ...newFixtures]);
          }
          
          return { ...tournament, teams: updatedTeams };
        }
        return tournament;
      })
    );
  };

  const removeTeamFromTournament = (tournamentId: string, teamId: string) => {
    setTournaments(
      tournaments.map((tournament) => {
        if (tournament.id === tournamentId) {
          const updatedTeams = tournament.teams.filter((id) => id !== teamId);
          
          // Regenerate fixtures
          const tournamentTeams = teamRegistrations.filter((team) =>
            updatedTeams.includes(team.id)
          );
          
          // Remove old fixtures for this tournament
          setMatches(prevMatches => prevMatches.filter(m => m.tournamentId !== tournamentId));
          
          if (tournamentTeams.length >= 2) {
            // Generate new fixtures
            const newFixtures = generateFixtures(tournament, tournamentTeams);
            setMatches(prevMatches => [...prevMatches, ...newFixtures]);
          }
          
          return { ...tournament, teams: updatedTeams };
        }
        return tournament;
      })
    );
  };

  const updateMatchResult = (matchId: string, team1Score: number, team2Score: number) => {
    setMatches(
      matches.map((match) =>
        match.id === matchId
          ? {
              ...match,
              team1Score,
              team2Score,
              status: "completed" as const,
            }
          : match
      )
    );
  };

  const getPendingTeams = () => {
    return teamRegistrations.filter((team) => team.status === "pending");
  };

  const getApprovedTeamsBySport = (sport: string) => {
    return teamRegistrations.filter((team) => team.status === "approved" && team.sport === sport);
  };

  const getTournamentTeams = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return [];
    return teamRegistrations.filter((team) => tournament.teams.includes(team.id));
  };

  const getTournamentMatches = (tournamentId: string) => {
    return matches.filter((match) => match.tournamentId === tournamentId);
  };

  const getTournamentStandings = (tournamentId: string): Standing[] => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return [];
    
    const tournamentMatches = getTournamentMatches(tournamentId);
    const tournamentTeams = getTournamentTeams(tournamentId);
    
    // Initialize standings
    const standings: Record<string, Standing> = {};
    tournamentTeams.forEach((team) => {
      standings[team.id] = {
        teamId: team.id,
        teamName: team.teamName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });
    
    // Calculate standings from completed matches
    tournamentMatches
      .filter((match) => match.status === "completed" && match.team1Score !== null && match.team2Score !== null)
      .forEach((match) => {
        const team1 = standings[match.team1Id];
        const team2 = standings[match.team2Id];
        
        if (!team1 || !team2) return;
        
        team1.played++;
        team2.played++;
        
        team1.goalsFor += match.team1Score!;
        team1.goalsAgainst += match.team2Score!;
        team2.goalsFor += match.team2Score!;
        team2.goalsAgainst += match.team1Score!;
        
        if (match.team1Score! > match.team2Score!) {
          team1.won++;
          team1.points += 3;
          team2.lost++;
        } else if (match.team1Score! < match.team2Score!) {
          team2.won++;
          team2.points += 3;
          team1.lost++;
        } else {
          team1.drawn++;
          team2.drawn++;
          team1.points += 1;
          team2.points += 1;
        }
        
        team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
        team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
      });
    
    // Sort standings
    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const approvedTeams = teamRegistrations.filter((team) => team.status === "approved");

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        teamRegistrations,
        approvedTeams,
        matches,
        addTournament,
        addTeamRegistration,
        approveTeam,
        rejectTeam,
        addTeamToTournament,
        removeTeamFromTournament,
        updateMatchResult,
        getPendingTeams,
        getApprovedTeamsBySport,
        getTournamentTeams,
        getTournamentMatches,
        getTournamentStandings,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
}