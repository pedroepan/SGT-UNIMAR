import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trophy, Calendar, Clock, Edit } from "lucide-react";
import { useTournament } from "../context/tournament-context";
import { MatchResultDialog } from "./match-result-dialog";
import type { Match } from "../context/tournament-context";
import { useAuth } from "../context/auth-context";

export function Fixture() {
  const { tournaments, matches, getTournamentMatches, getTournamentStandings } = useTournament();
  const { user } = useAuth();
  const isAdmin = user?.rol === "administrador";
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const activeTournaments = tournaments.filter(t => t.teams.length >= 2);

  const filteredMatches = selectedTournament === "all"
    ? matches
    : getTournamentMatches(selectedTournament);

  // Sort matches by date
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const upcomingMatches = sortedMatches.filter(m => m.status === "scheduled");
  const completedMatches = sortedMatches.filter(m => m.status === "completed");

  const handleEditResult = (match: Match) => {
    if (!isAdmin) return;
    setSelectedMatch(match);
    setResultDialogOpen(true);
  };

  const selectedTournamentData = tournaments.find(t => t.id === selectedTournament);
  const standings = selectedTournament !== "all" && selectedTournamentData
    ? getTournamentStandings(selectedTournament)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl">Fixtures y Resultados</h1>
          <p className="text-muted-foreground mt-1">
            Calendario de partidos y tabla de posiciones
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedTournament} onValueChange={setSelectedTournament}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por torneo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los torneos</SelectItem>
              {activeTournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Standings Table - Only show when a specific tournament is selected */}
      {selectedTournament !== "all" && selectedTournamentData && standings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <CardTitle>Tabla de Posiciones - {selectedTournamentData.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Equipo</th>
                    <th className="text-center p-3 font-medium">PJ</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">G</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">E</th>
                    <th className="text-center p-3 font-medium hidden sm:table-cell">P</th>
                    <th className="text-center p-3 font-medium hidden md:table-cell">GF</th>
                    <th className="text-center p-3 font-medium hidden md:table-cell">GC</th>
                    <th className="text-center p-3 font-medium">DG</th>
                    <th className="text-center p-3 font-medium bg-primary/5">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr
                      key={standing.teamId}
                      className={`border-b hover:bg-gray-50 ${
                        index === 0 ? "bg-accent/5" : ""
                      }`}
                    >
                      <td className="p-3 font-medium">
                        {index === 0 && <Trophy className="h-4 w-4 text-accent inline mr-1" />}
                        {index + 1}
                      </td>
                      <td className="p-3 font-medium">{standing.teamName}</td>
                      <td className="text-center p-3">{standing.played}</td>
                      <td className="text-center p-3 hidden sm:table-cell text-secondary">
                        {standing.won}
                      </td>
                      <td className="text-center p-3 hidden sm:table-cell text-gray-600">
                        {standing.drawn}
                      </td>
                      <td className="text-center p-3 hidden sm:table-cell text-destructive">
                        {standing.lost}
                      </td>
                      <td className="text-center p-3 hidden md:table-cell">{standing.goalsFor}</td>
                      <td className="text-center p-3 hidden md:table-cell">
                        {standing.goalsAgainst}
                      </td>
                      <td
                        className={`text-center p-3 font-medium ${
                          standing.goalDifference > 0
                            ? "text-secondary"
                            : standing.goalDifference < 0
                            ? "text-destructive"
                            : ""
                        }`}
                      >
                        {standing.goalDifference > 0 ? "+" : ""}
                        {standing.goalDifference}
                      </td>
                      <td className="text-center p-3 font-bold text-primary bg-primary/5">
                        {standing.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>PJ: Partidos Jugados | G: Ganados | E: Empatados | P: Perdidos</p>
              <p>GF: Goles a Favor | GC: Goles en Contra | DG: Diferencia de Goles | Pts: Puntos</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No matches message */}
      {sortedMatches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No hay partidos programados</h3>
            <p className="text-sm text-muted-foreground">
              Los partidos se generarán automáticamente cuando se agreguen equipos a los torneos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Próximos Partidos</h2>
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {match.tournamentName}
                        </span>
                      </div>
                      <Badge variant="outline">Programado</Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-right font-medium">{match.team1Name}</div>
                      <div className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-muted-foreground">
                        VS
                      </div>
                      <div className="flex-1 text-left font-medium">{match.team2Name}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(match.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {match.time}
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleEditResult(match)}
                        >
                          <Edit className="h-4 w-4" />
                          Registrar Resultado
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Matches */}
      {completedMatches.length > 0 && (
        <div>
          <h2 className="text-xl mb-4">Partidos Finalizados</h2>
          <div className="space-y-3">
            {completedMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                          {match.tournamentName}
                        </span>
                      </div>
                      <Badge className="bg-secondary">Finalizado</Badge>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="font-medium">{match.team1Name}</div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                        <span
                          className={`text-2xl font-bold ${
                            match.team1Score! > match.team2Score!
                              ? "text-secondary"
                              : match.team1Score! < match.team2Score!
                              ? "text-muted-foreground"
                              : ""
                          }`}
                        >
                          {match.team1Score}
                        </span>
                        <span className="text-lg text-muted-foreground">-</span>
                        <span
                          className={`text-2xl font-bold ${
                            match.team2Score! > match.team1Score!
                              ? "text-secondary"
                              : match.team2Score! < match.team1Score!
                              ? "text-muted-foreground"
                              : ""
                          }`}
                        >
                          {match.team2Score}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{match.team2Name}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(match.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {match.time}
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                          onClick={() => handleEditResult(match)}
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Match Result Dialog */}
      <MatchResultDialog
        match={selectedMatch}
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
      />
    </div>
  );
}
