import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export interface Player {
  name: string;
  ci: string;
}

export interface TeamRegistration {
  id: string;
  teamName: string;
  sport: string;
  tournamentId?: string;
  requesterRole?: "administrador" | "jugador";
  captainName: string;
  captainCI: string;
  captainPhone: string;
  captainEmail: string;
  captainUserId?: string;
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
  teams: string[];
}

type TorneoRow = {
  id: number;
  created_at: string;
  nombre: string;
  disciplina: string;
  estado: "active" | "completed" | "upcoming";
};

type EquipoRow = {
  id: number;
  created_at: string;
  nombre: string;
  id_capitan: number | null;
  id_torneo: number | null;
};

type JugadorRow = {
  id: number;
  created_at: string;
  id_usuario: number;
  id_equipo: number;
};

type UsuarioRow = {
  id: number;
  created_at: string;
  nombre: string;
  correo: string;
  cedula: string;
  rol: string;
};

type FixtureRow = {
  id: number;
  created_at: string;
  id_torneo: number;
  id_visitantes: number;
  fecha_hora: string;
  id_local: number;
  anotacion_local: number | null;
  anotacion_visitante: number | null;
};

interface TournamentContextType {
  tournaments: Tournament[];
  teamRegistrations: TeamRegistration[];
  approvedTeams: TeamRegistration[];
  matches: Match[];
  refreshData: () => Promise<void>;
  addTournament: (tournament: Omit<Tournament, "id" | "teams">) => Promise<void>;
  updateTournament: (
    tournamentId: string,
    updates: Pick<Tournament, "name" | "sport" | "status">,
  ) => Promise<void>;
  deleteTournament: (tournamentId: string) => Promise<void>;
  addTeamRegistration: (team: Omit<TeamRegistration, "id" | "submittedDate" | "status">) => Promise<void>;
  approveTeam: (teamId: string) => Promise<void>;
  rejectTeam: (teamId: string) => Promise<void>;
  addTeamToTournament: (tournamentId: string, teamId: string) => Promise<void>;
  removeTeamFromTournament: (tournamentId: string, teamId: string) => Promise<void>;
  addPlayerToTeam: (teamId: string, player: Player) => Promise<void>;
  removePlayerFromTeam: (teamId: string, playerCi: string) => Promise<void>;
  updateMatchResult: (matchId: string, team1Score: number, team2Score: number) => Promise<void>;
  getPendingTeams: () => TeamRegistration[];
  getApprovedTeamsBySport: (sport: string) => TeamRegistration[];
  getTournamentTeams: (tournamentId: string) => TeamRegistration[];
  getTournamentMatches: (tournamentId: string) => Match[];
  getTournamentStandings: (tournamentId: string) => Standing[];
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

function generateRandomTime(): string {
  const hours = [13, 14, 15, 16, 17];
  const minutes = [0, 15, 30, 45];
  const hour = hours[Math.floor(Math.random() * hours.length)];
  const minute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function sportToDbSport(sport: string): string {
  return sport.toLowerCase().replace(/\s+/g, " ").trim();
}

function formatDateParts(isoDateTime: string) {
  const date = new Date(isoDateTime);
  const datePart = date.toISOString().split("T")[0];
  const timePart = date.toISOString().substring(11, 16);
  return { datePart, timePart };
}

function buildFixtureRows(tournamentId: number, teamIds: number[], startDateIso: string) {
  const startDate = new Date(startDateIso);
  const rows: Array<{
    id_torneo: number;
    id_local: number;
    id_visitantes: number;
    fecha_hora: string;
    anotacion_local: number | null;
    anotacion_visitante: number | null;
  }> = [];

  let offset = 0;
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + offset * 2);
      const time = generateRandomTime();
      const datePart = date.toISOString().split("T")[0];

      rows.push({
        id_torneo: tournamentId,
        id_local: teamIds[i],
        id_visitantes: teamIds[j],
        fecha_hora: `${datePart}T${time}:00`,
        anotacion_local: null,
        anotacion_visitante: null,
      });

      offset += 1;
    }
  }

  return rows;
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teamRegistrations, setTeamRegistrations] = useState<TeamRegistration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const loadData = async () => {
    const { data: torneosData, error: torneosError } = await supabase
      .from("torneos")
      .select("id, created_at, nombre, disciplina, estado");

    if (torneosError) {
      throw new Error(`Error cargando torneos: ${torneosError.message}`);
    }

    const torneos = (torneosData ?? []) as TorneoRow[];

    const { data: equiposData, error: equiposError } = await supabase
      .from("equipo")
      .select("id, created_at, nombre, id_capitan, id_torneo");

    if (equiposError) {
      throw new Error(`Error cargando equipos: ${equiposError.message}`);
    }

    const equipos = (equiposData ?? []) as EquipoRow[];

    const { data: jugadoresData, error: jugadoresError } = await supabase
      .from("jugadores")
      .select("id, created_at, id_usuario, id_equipo");

    if (jugadoresError) {
      throw new Error(`Error cargando jugadores: ${jugadoresError.message}`);
    }

    const jugadores = (jugadoresData ?? []) as JugadorRow[];
    const usuarioIds = [...new Set(jugadores.map((j) => j.id_usuario))];

    let usuarios: UsuarioRow[] = [];
    if (usuarioIds.length > 0) {
      const { data: usuariosData, error: usuariosError } = await supabase
        .from("usuarios")
        .select("id, created_at, nombre, correo, cedula, rol")
        .in("id", usuarioIds);

      if (usuariosError) {
        throw new Error(`Error cargando usuarios: ${usuariosError.message}`);
      }

      usuarios = (usuariosData ?? []) as UsuarioRow[];
    }

    const { data: fixturesData, error: fixturesError } = await supabase
      .from("fixture")
      .select(
        "id, created_at, id_torneo, id_visitantes, fecha_hora, id_local, anotacion_local, anotacion_visitante",
      );

    if (fixturesError) {
      throw new Error(`Error cargando fixture: ${fixturesError.message}`);
    }

    const fixtures = (fixturesData ?? []) as FixtureRow[];

    const torneoById = new Map(torneos.map((t) => [String(t.id), t]));
    const equipoById = new Map(equipos.map((e) => [String(e.id), e]));
    const jugadorById = new Map(jugadores.map((j) => [String(j.id), j]));
    const usuariosById = new Map(usuarios.map((u) => [String(u.id), u]));

    const teamsByTournament = equipos.reduce<Record<string, string[]>>((acc, team) => {
      if (!team.id_torneo) return acc;
      const key = String(team.id_torneo);
      if (!acc[key]) acc[key] = [];
      acc[key].push(String(team.id));
      return acc;
    }, {});

    const mappedTournamentsRaw: Tournament[] = torneos.map((t) => ({
      id: String(t.id),
      name: t.nombre,
      sport: t.disciplina,
      startDate: t.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
      status: t.estado,
      teams: teamsByTournament[String(t.id)] ?? [],
    }));

    const mappedTournaments: Tournament[] = Array.from(
      mappedTournamentsRaw.reduce<Map<string, Tournament>>((acc, tournament) => {
        const key = `${tournament.name}||${tournament.sport}`;
        const previous = acc.get(key);

        if (!previous) {
          acc.set(key, tournament);
          return acc;
        }

        const previousTeams = previous.teams.length;
        const currentTeams = tournament.teams.length;

        if (currentTeams > previousTeams) {
          acc.set(key, tournament);
          return acc;
        }

        if (currentTeams === previousTeams && Number(tournament.id) < Number(previous.id)) {
          acc.set(key, tournament);
        }

        return acc;
      }, new Map()).values(),
    );

    const playersByTeam = jugadores.reduce<Record<string, Player[]>>((acc, jugador) => {
      const key = String(jugador.id_equipo);
      const usuario = usuariosById.get(String(jugador.id_usuario));
      if (!usuario) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ name: usuario.nombre, ci: usuario.cedula });
      return acc;
    }, {});

    const mappedTeams: TeamRegistration[] = equipos.map((team) => {
      const teamTournament = team.id_torneo ? torneoById.get(String(team.id_torneo)) : null;
      const captainJugador = team.id_capitan ? jugadorById.get(String(team.id_capitan)) : undefined;
      const captainUsuario = captainJugador
        ? usuariosById.get(String(captainJugador.id_usuario))
        : undefined;

      const captainRole = captainUsuario?.rol?.toLowerCase() ?? "";
      const status: TeamRegistration["status"] = captainRole.includes("pend") ? "pending" : "approved";

      return {
        id: String(team.id),
        teamName: team.nombre,
        tournamentId: team.id_torneo ? String(team.id_torneo) : undefined,
        sport: teamTournament?.disciplina ?? "Sin disciplina",
        captainName: captainUsuario?.nombre ?? "Sin capitán",
        captainCI: captainUsuario?.cedula ?? "",
        captainPhone: "",
        captainEmail: captainUsuario?.correo ?? "",
        players: playersByTeam[String(team.id)] ?? [],
        submittedDate: team.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
        status,
      };
    });

    const tournamentsNeedingFixtures = torneos.filter((torneo) => {
      const teamIds = (teamsByTournament[String(torneo.id)] ?? []).map((teamId) => Number(teamId));
      const hasFixtures = fixtures.some((fixture) => fixture.id_torneo === torneo.id);
      return teamIds.length >= 2 && !hasFixtures;
    });

    if (tournamentsNeedingFixtures.length > 0) {
      for (const torneo of tournamentsNeedingFixtures) {
        const teamIds = (teamsByTournament[String(torneo.id)] ?? []).map((teamId) => Number(teamId));
        const fixtureRows = buildFixtureRows(torneo.id, teamIds, torneo.created_at);

        if (fixtureRows.length === 0) continue;

        const { error: insertError } = await supabase.from("fixture").insert(fixtureRows);
        if (insertError) {
          throw new Error(`No se pudo autogenerar fixtures para ${torneo.nombre}: ${insertError.message}`);
        }
      }

      await loadData();
      return;
    }

    const mappedMatches: Match[] = fixtures
      .filter((f) => f.id_torneo && f.id_local && f.id_visitantes)
      .map((f) => {
        const torneo = torneoById.get(String(f.id_torneo));
        const local = equipoById.get(String(f.id_local));
        const visitante = equipoById.get(String(f.id_visitantes));
        const { datePart, timePart } = formatDateParts(f.fecha_hora);

        return {
          id: String(f.id),
          tournamentId: String(f.id_torneo),
          tournamentName: torneo?.nombre ?? "Torneo",
          sport: torneo?.disciplina ?? "",
          team1Id: String(f.id_local),
          team2Id: String(f.id_visitantes),
          team1Name: local?.nombre ?? "Local",
          team2Name: visitante?.nombre ?? "Visitante",
          date: datePart,
          time: timePart,
          team1Score: f.anotacion_local,
          team2Score: f.anotacion_visitante,
          status:
            f.anotacion_local !== null && f.anotacion_visitante !== null
              ? "completed"
              : "scheduled",
        };
      });

    setTournaments(mappedTournaments);
    setTeamRegistrations(mappedTeams);
    setMatches(mappedMatches);
  };

  useEffect(() => {
    void loadData().catch((error) => {
      console.error("[tournament-context]", error);
      setTournaments([]);
      setTeamRegistrations([]);
      setMatches([]);
    });
  }, []);

  const addTournament = async (tournament: Omit<Tournament, "id" | "teams">) => {
    const { data: existing, error: existingError } = await supabase
      .from("torneos")
      .select("id")
      .eq("nombre", tournament.name)
      .eq("disciplina", tournament.sport)
      .limit(1);

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing && existing.length > 0) {
      throw new Error("Ya existe un torneo con ese nombre y disciplina.");
    }

    const { error } = await supabase.from("torneos").insert({
      nombre: tournament.name,
      disciplina: tournament.sport,
      estado: tournament.status,
    });

    if (error) {
      throw new Error(error.message);
    }

    await loadData();
  };

  const updateTournament = async (
    tournamentId: string,
    updates: Pick<Tournament, "name" | "sport" | "status">,
  ) => {
    const { error } = await supabase
      .from("torneos")
      .update({
        nombre: updates.name,
        disciplina: updates.sport,
        estado: updates.status,
      })
      .eq("id", Number(tournamentId));

    if (error) {
      throw new Error(error.message);
    }

    await loadData();
  };

  const deleteTournament = async (tournamentId: string) => {
    const tournamentNumericId = Number(tournamentId);

    const { error: fixturesError } = await supabase
      .from("fixture")
      .delete()
      .eq("id_torneo", tournamentNumericId);

    if (fixturesError) {
      throw new Error(fixturesError.message);
    }

    const { error: unlinkTeamsError } = await supabase
      .from("equipo")
      .update({ id_torneo: null })
      .eq("id_torneo", tournamentNumericId);

    if (unlinkTeamsError) {
      throw new Error(unlinkTeamsError.message);
    }

    const { error: tournamentError } = await supabase
      .from("torneos")
      .delete()
      .eq("id", tournamentNumericId);

    if (tournamentError) {
      throw new Error(tournamentError.message);
    }

    await loadData();
  };

  const addTeamRegistration = async (
    team: Omit<TeamRegistration, "id" | "submittedDate" | "status">,
  ) => {
    const normalizedSport = sportToDbSport(team.sport);

    const { data: torneo, error: torneoError } = await supabase
      .from("torneos")
      .select("id, disciplina")
      .limit(100);

    if (torneoError) {
      throw new Error(`No se pudo obtener torneos: ${torneoError.message}`);
    }

    const torneoDestino = team.tournamentId
      ? (torneo ?? []).find((t) => String(t.id) === String(team.tournamentId))
      : (torneo ?? []).find((t) => sportToDbSport(String(t.disciplina)) === normalizedSport);

    if (!torneoDestino) {
      throw new Error("No hay un torneo creado para esa disciplina.");
    }

    const { data: nuevoEquipo, error: equipoError } = await supabase
      .from("equipo")
      .insert({
        nombre: team.teamName,
        id_torneo: torneoDestino.id,
      })
      .select("id")
      .single();

    if (equipoError || !nuevoEquipo) {
      throw new Error(`No se pudo crear equipo: ${equipoError?.message ?? "error desconocido"}`);
    }

    const autoApprove = team.requesterRole === "administrador";
    const captainRole = autoApprove ? "capitan" : "pendiente_capitan";
    const playerRole = autoApprove ? "jugador" : "pendiente_jugador";

    let capitanUsuarioId: number;
    let capitanJugadorId: number;

    if (team.captainUserId) {
      capitanUsuarioId = Number(team.captainUserId);

      const { error: captainRoleError } = await supabase
        .from("usuarios")
        .update({ rol: captainRole })
        .eq("id", capitanUsuarioId);

      if (captainRoleError) {
        throw new Error(`No se pudo actualizar el capitán existente: ${captainRoleError.message}`);
      }

      const { data: existingCaptainJugador, error: existingCaptainJugadorError } = await supabase
        .from("jugadores")
        .select("id, id_usuario, id_equipo")
        .eq("id_usuario", capitanUsuarioId)
        .maybeSingle() as {
        data: { id: number; id_usuario: number; id_equipo: number | null } | null;
        error: { message: string } | null;
      };

      if (existingCaptainJugadorError) {
        throw new Error(`No se pudo obtener el jugador existente del capitán: ${existingCaptainJugadorError.message}`);
      }

      if (existingCaptainJugador) {
        capitanJugadorId = existingCaptainJugador.id;

        if (existingCaptainJugador.id_equipo !== Number(nuevoEquipo.id)) {
          const { error: updateCaptainTeamError } = await supabase
            .from("jugadores")
            .update({ id_equipo: Number(nuevoEquipo.id) })
            .eq("id", existingCaptainJugador.id);

          if (updateCaptainTeamError) {
            throw new Error(`No se pudo asignar el capitán al equipo: ${updateCaptainTeamError.message}`);
          }
        }
      } else {
        const { data: newCaptainJugador, error: newCaptainJugadorError } = await supabase
          .from("jugadores")
          .insert({
            id_usuario: capitanUsuarioId,
            id_equipo: Number(nuevoEquipo.id),
          })
          .select("id, id_usuario")
          .single() as {
          data: { id: number; id_usuario: number } | null;
          error: { message: string } | null;
        };

        if (newCaptainJugadorError || !newCaptainJugador) {
          throw new Error(`No se pudo registrar al capitán como jugador: ${newCaptainJugadorError?.message ?? "error desconocido"}`);
        }

        capitanJugadorId = newCaptainJugador.id;
      }
    } else {
      const { data: capitanUsuario, error: capitanUsuarioError } = await supabase
        .from("usuarios")
        .insert({
          nombre: team.captainName,
          correo: team.captainEmail,
          cedula: team.captainCI,
          password: "temporal123",
          rol: captainRole,
        })
        .select("id")
        .single() as {
        data: { id: number } | null;
        error: { message: string } | null;
      };

      if (capitanUsuarioError || !capitanUsuario) {
        throw new Error(`No se pudo crear usuario ${team.captainName}: ${capitanUsuarioError?.message}`);
      }

      capitanUsuarioId = Number(capitanUsuario.id);

      const { data: capitanJugador, error: capitanJugadorError } = await supabase
        .from("jugadores")
        .insert({
          id_usuario: capitanUsuarioId,
          id_equipo: Number(nuevoEquipo.id),
        })
        .select("id, id_usuario")
        .single() as {
        data: { id: number; id_usuario: number } | null;
        error: { message: string } | null;
      };

      if (capitanJugadorError || !capitanJugador) {
        throw new Error(`No se pudo crear jugador capitán: ${capitanJugadorError?.message}`);
      }

      capitanJugadorId = Number(capitanJugador.id);
    }

    const otherPlayers = team.players
      .filter((p) => p.ci !== team.captainCI)
      .map((p, index) => ({
        name: p.name,
        ci: p.ci,
        email: `jugador.${p.ci.replace(/[^0-9a-zA-Z]/g, "")}.${Date.now()}.${index}@unimar.test`,
        role: playerRole,
      }));

    const nuevosUsuarios: Array<{ id: number }> = [];

    for (const person of otherPlayers) {
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .insert({
          nombre: person.name,
          correo: person.email,
          cedula: person.ci,
          password: "temporal123",
          rol: person.role,
        })
        .select("id")
        .single() as {
        data: { id: number } | null;
        error: { message: string } | null;
      };

      if (usuarioError || !usuario) {
        throw new Error(`No se pudo crear usuario ${person.name}: ${usuarioError?.message}`);
      }

      nuevosUsuarios.push({ id: Number(usuario.id) });
    }

    const jugadoresPayload = nuevosUsuarios.map((u) => ({
      id_usuario: u.id,
      id_equipo: Number(nuevoEquipo.id),
    }));

    const { data: nuevosJugadores, error: jugadoresError } = await supabase
      .from("jugadores")
      .insert(jugadoresPayload)
      .select("id, id_usuario") as {
      data: Array<{ id: number; id_usuario: number }> | null;
      error: { message: string } | null;
    };

    if (jugadoresError || !nuevosJugadores || nuevosJugadores.length === 0) {
      throw new Error(`No se pudo crear jugadores: ${jugadoresError?.message}`);
    }

    const { error: updateError } = await supabase
      .from("equipo")
      .update({ id_capitan: capitanJugadorId })
      .eq("id", nuevoEquipo.id);

    if (updateError) {
      throw new Error(`No se pudo asignar capitán: ${updateError.message}`);
    }

    await loadData();
  };

  const approveTeam = async (teamId: string) => {
    const { data: jugadores, error: jugadoresError } = await supabase
      .from("jugadores")
      .select("id, id_usuario")
      .eq("id_equipo", Number(teamId)) as {
      data: Array<{ id: number; id_usuario: number }> | null;
      error: { message: string } | null;
    };

    if (jugadoresError) {
      throw new Error(jugadoresError.message);
    }

    const team = teamRegistrations.find((t) => t.id === teamId);
    const capitanCedula = team?.captainCI;

    for (const jugador of jugadores ?? []) {
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("id, cedula")
        .eq("id", jugador.id_usuario)
        .single() as {
        data: { id: number; cedula: string } | null;
        error: { message: string } | null;
      };

      if (usuarioError || !usuario) continue;

      const nextRole = usuario.cedula === capitanCedula ? "capitan" : "jugador";
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ rol: nextRole })
        .eq("id", usuario.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    await loadData();
  };

  const rejectTeam = async (teamId: string) => {
    const teamNumericId = Number(teamId);

    const { error: unlinkCaptainError } = await supabase
      .from("equipo")
      .update({ id_capitan: null })
      .eq("id", teamNumericId);

    if (unlinkCaptainError) {
      throw new Error(unlinkCaptainError.message);
    }

    const { error: fixturesError } = await supabase
      .from("fixture")
      .delete()
      .or(`id_local.eq.${teamNumericId},id_visitantes.eq.${teamNumericId}`);

    if (fixturesError) {
      throw new Error(fixturesError.message);
    }

    const { error: jugadoresError } = await supabase
      .from("jugadores")
      .delete()
      .eq("id_equipo", teamNumericId);

    if (jugadoresError) {
      throw new Error(jugadoresError.message);
    }

    const { error } = await supabase.from("equipo").delete().eq("id", teamNumericId);
    if (error) {
      throw new Error(error.message);
    }

    await loadData();
  };

  const regenerateFixtures = async (tournamentId: string) => {
    const enrolledTeams = teamRegistrations.filter(
      (team) => team.status === "approved" && tournaments.find((t) => t.id === tournamentId)?.teams.includes(team.id),
    );

    const { error: deleteError } = await supabase
      .from("fixture")
      .delete()
      .eq("id_torneo", Number(tournamentId));

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (enrolledTeams.length < 2) return;

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return;

    const startDate = new Date(tournament.startDate);
    const fixtureRows: Array<{
      id_torneo: number;
      id_local: number;
      id_visitantes: number;
      fecha_hora: string;
      anotacion_local: number | null;
      anotacion_visitante: number | null;
    }> = [];

    let offset = 0;
    for (let i = 0; i < enrolledTeams.length; i++) {
      for (let j = i + 1; j < enrolledTeams.length; j++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + offset * 2);
        const time = generateRandomTime();
        const datePart = date.toISOString().split("T")[0];
        fixtureRows.push({
          id_torneo: Number(tournamentId),
          id_local: Number(enrolledTeams[i].id),
          id_visitantes: Number(enrolledTeams[j].id),
          fecha_hora: `${datePart}T${time}:00`,
          anotacion_local: null,
          anotacion_visitante: null,
        });
        offset += 1;
      }
    }

    const { error: insertError } = await supabase.from("fixture").insert(fixtureRows);
    if (insertError) {
      throw new Error(insertError.message);
    }
  };

  const addTeamToTournament = async (tournamentId: string, teamId: string) => {
    const { error } = await supabase
      .from("equipo")
      .update({ id_torneo: Number(tournamentId) })
      .eq("id", Number(teamId));

    if (error) {
      throw new Error(error.message);
    }

    await loadData();
    await regenerateFixtures(tournamentId);
    await loadData();
  };

  const removeTeamFromTournament = async (tournamentId: string, teamId: string) => {
    const { error } = await supabase
      .from("equipo")
      .update({ id_torneo: null })
      .eq("id", Number(teamId));

    if (error) {
      throw new Error(error.message);
    }

    await loadData();
    await regenerateFixtures(tournamentId);
    await loadData();
  };

  const addPlayerToTeam = async (teamId: string, player: Player) => {
    const teamNumericId = Number(teamId);
    const playerName = player.name.trim();
    const playerCi = player.ci.trim();

    if (!playerName || !playerCi) {
      throw new Error("Debes completar el nombre y la cédula del jugador.");
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from("usuarios")
      .select("id, nombre, cedula, rol")
      .eq("cedula", playerCi)
      .maybeSingle() as {
      data: { id: number; nombre: string; cedula: string; rol: string } | null;
      error: { message: string } | null;
    };

    if (existingUserError) {
      throw new Error(existingUserError.message);
    }

    const { data: currentTeam, error: currentTeamError } = await supabase
      .from("equipo")
      .select("id, id_capitan")
      .eq("id", teamNumericId)
      .maybeSingle() as {
      data: { id: number; id_capitan: number | null } | null;
      error: { message: string } | null;
    };

    if (currentTeamError) {
      throw new Error(currentTeamError.message);
    }

    if (!currentTeam) {
      throw new Error("No se encontró el equipo seleccionado.");
    }

    if (existingUser) {
      const { data: otherPlayer, error: otherPlayerError } = await supabase
        .from("jugadores")
        .select("id, id_equipo")
        .eq("id_usuario", existingUser.id)
        .maybeSingle() as {
        data: { id: number; id_equipo: number | null } | null;
        error: { message: string } | null;
      };

      if (otherPlayerError) {
        throw new Error(otherPlayerError.message);
      }

      if (otherPlayer?.id_equipo && otherPlayer.id_equipo !== teamNumericId) {
        throw new Error("Ese jugador ya está inscrito en otro equipo.");
      }

      if (otherPlayer?.id_equipo === teamNumericId) {
        throw new Error("Ese jugador ya forma parte de este equipo.");
      }

      const { error: insertPlayerError } = await supabase
        .from("jugadores")
        .insert({ id_usuario: existingUser.id, id_equipo: teamNumericId });

      if (insertPlayerError) {
        throw new Error(insertPlayerError.message);
      }

      if (existingUser.rol !== "administrador") {
        const nextRole = existingUser.rol === "capitan" ? "capitan" : "jugador";
        const { error: updateRoleError } = await supabase
          .from("usuarios")
          .update({ rol: nextRole })
          .eq("id", existingUser.id);

        if (updateRoleError) {
          throw new Error(updateRoleError.message);
        }
      }
    } else {
      const { data: newUser, error: newUserError } = await supabase
        .from("usuarios")
        .insert({
          nombre: playerName,
          correo: `jugador.${playerCi.replace(/[^0-9a-zA-Z]/g, "")}.${Date.now()}@unimar.test`,
          cedula: playerCi,
          password: "temporal123",
          rol: "jugador",
        })
        .select("id")
        .single() as {
        data: { id: number } | null;
        error: { message: string } | null;
      };

      if (newUserError || !newUser) {
        throw new Error(`No se pudo crear el jugador: ${newUserError?.message ?? "error desconocido"}`);
      }

      const { error: insertPlayerError } = await supabase
        .from("jugadores")
        .insert({ id_usuario: newUser.id, id_equipo: teamNumericId });

      if (insertPlayerError) {
        throw new Error(insertPlayerError.message);
      }
    }

    await loadData();
  };

  const removePlayerFromTeam = async (teamId: string, playerCi: string) => {
    const teamNumericId = Number(teamId);
    const normalizedCi = playerCi.trim();

    const team = teamRegistrations.find((entry) => entry.id === teamId);
    if (team?.captainCI === normalizedCi) {
      throw new Error("No puedes eliminar al capitán desde esta opción.");
    }

    const { data: user, error: userError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("cedula", normalizedCi)
      .maybeSingle() as {
      data: { id: number } | null;
      error: { message: string } | null;
    };

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      throw new Error("No se encontró el jugador indicado.");
    }

    const { data: player, error: playerError } = await supabase
      .from("jugadores")
      .select("id, id_usuario, id_equipo")
      .eq("id_usuario", user.id)
      .eq("id_equipo", teamNumericId)
      .maybeSingle() as {
      data: { id: number; id_usuario: number; id_equipo: number } | null;
      error: { message: string } | null;
    };

    if (playerError) {
      throw new Error(playerError.message);
    }

    if (!player) {
      throw new Error("Ese jugador no pertenece a este equipo.");
    }

    const { error: deleteError } = await supabase
      .from("jugadores")
      .delete()
      .eq("id", player.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    await loadData();
  };

  const updateMatchResult = async (matchId: string, team1Score: number, team2Score: number) => {
    const { error } = await supabase
      .from("fixture")
      .update({
        anotacion_local: team1Score,
        anotacion_visitante: team2Score,
      })
      .eq("id", Number(matchId));

    if (error) {
      throw new Error(error.message);
    }

    await loadData();
  };

  const getPendingTeams = () => teamRegistrations.filter((team) => team.status === "pending");

  const getApprovedTeamsBySport = (sport: string) =>
    teamRegistrations.filter((team) => team.status === "approved" && team.sport === sport);

  const getTournamentTeams = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return [];
    return teamRegistrations.filter((team) => tournament.teams.includes(team.id));
  };

  const getTournamentMatches = (tournamentId: string) =>
    matches.filter((match) => match.tournamentId === tournamentId);

  const getTournamentStandings = (tournamentId: string): Standing[] => {
    const tournamentTeams = getTournamentTeams(tournamentId);
    const tournamentMatches = getTournamentMatches(tournamentId);

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

    tournamentMatches
      .filter((match) => match.status === "completed" && match.team1Score !== null && match.team2Score !== null)
      .forEach((match) => {
        const team1 = standings[match.team1Id];
        const team2 = standings[match.team2Id];
        if (!team1 || !team2) return;

        team1.played += 1;
        team2.played += 1;

        team1.goalsFor += match.team1Score as number;
        team1.goalsAgainst += match.team2Score as number;
        team2.goalsFor += match.team2Score as number;
        team2.goalsAgainst += match.team1Score as number;

        if ((match.team1Score as number) > (match.team2Score as number)) {
          team1.won += 1;
          team2.lost += 1;
          team1.points += 3;
        } else if ((match.team1Score as number) < (match.team2Score as number)) {
          team2.won += 1;
          team1.lost += 1;
          team2.points += 3;
        } else {
          team1.drawn += 1;
          team2.drawn += 1;
          team1.points += 1;
          team2.points += 1;
        }

        team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
        team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
      });

    return Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const approvedTeams = useMemo(
    () => teamRegistrations.filter((team) => team.status === "approved"),
    [teamRegistrations],
  );

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        teamRegistrations,
        approvedTeams,
        matches,
        refreshData: loadData,
        addTournament,
        updateTournament,
        deleteTournament,
        addTeamRegistration,
        approveTeam,
        rejectTeam,
        addTeamToTournament,
        removeTeamFromTournament,
        addPlayerToTeam,
        removePlayerFromTeam,
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
