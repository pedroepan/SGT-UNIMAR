import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Plus,
  Trophy,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTournament } from "../context/tournament-context";
import { CreateTournamentDialog } from "./create-tournament-dialog";
import { TeamDetailsDialog } from "./team-details-dialog";
import { TournamentDetailsDialog } from "./tournament-details-dialog";
import type { Tournament } from "../context/tournament-context";
import type { TeamRegistration } from "../context/tournament-context";
import { toast } from "sonner";

export function AdminDashboard() {
  const {
    tournaments,
    getPendingTeams,
    approveTeam,
    rejectTeam,
    approvedTeams,
  } = useTournament();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [tournamentDialogMode, setTournamentDialogMode] = useState<"view" | "manage">("view");
  const [selectedTeam, setSelectedTeam] = useState<TeamRegistration | null>(null);
  const [teamDetailsDialogOpen, setTeamDetailsDialogOpen] = useState(false);
  const [teamDialogMode, setTeamDialogMode] = useState<"view" | "manage">("view");

  const pendingRegistrations = getPendingTeams();
  const enrolledTeams = approvedTeams;
  
  const stats = [
    { label: "Torneos Activos", value: tournaments.filter(t => t.status === "active").length, icon: Trophy, color: "text-primary" },
    { label: "Equipos Aprobados", value: approvedTeams.length, icon: Users, color: "text-secondary" },
    { label: "Total Torneos", value: tournaments.length, icon: Calendar, color: "text-accent" },
    { label: "Inscripciones Pendientes", value: pendingRegistrations.length, icon: Clock, color: "text-yellow-600" },
  ];

  const handleViewDetails = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setTournamentDialogMode("view");
    setDetailsDialogOpen(true);
  };

  const handleManageTournament = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setTournamentDialogMode("manage");
    setDetailsDialogOpen(true);
  };

  const handleViewTeamDetails = (team: TeamRegistration) => {
    setSelectedTeam(team);
    setTeamDialogMode("view");
    setTeamDetailsDialogOpen(true);
  };

  const handleManageTeam = (team: TeamRegistration) => {
    setSelectedTeam(team);
    setTeamDialogMode("manage");
    setTeamDetailsDialogOpen(true);
  };

  const handleApprove = async (teamId: string) => {
    const team = pendingRegistrations.find(t => t.id === teamId);
    try {
      await approveTeam(teamId);
      toast.success("Equipo aprobado", {
        description: `El equipo "${team?.teamName}" ha sido aprobado. Ahora puedes agregarlo a un torneo.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar el equipo";
      toast.error("Error al aprobar", { description: message });
    }
  };

  const handleReject = async (teamId: string) => {
    const team = pendingRegistrations.find(t => t.id === teamId);
    if (confirm(`¿Estás seguro de que deseas rechazar la inscripción del equipo "${team?.teamName}"? Esta acción no se puede deshacer.`)) {
      try {
        await rejectTeam(teamId);
        toast.error("Inscripción rechazada", {
          description: `La inscripción del equipo "${team?.teamName}" ha sido eliminada.`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo rechazar el equipo";
        toast.error("Error al rechazar", { description: message });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl">Dashboard del Administrador</h1>
          <p className="text-muted-foreground mt-1">
            Gestión de torneos deportivos - Universidad de Margarita
          </p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90 gap-2 w-full sm:w-auto"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-5 w-5" />
          Crear Nuevo Torneo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-t-4 border-t-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tournaments Grid */}
      <div>
        <h2 className="text-xl mb-4">Todos los Torneos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tournament.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tournament.sport}</p>
                    </div>
                  </div>
                  <Badge className={tournament.status === "active" ? "bg-secondary" : "bg-gray-500"}>
                    {tournament.status === "active" ? "Activo" : "Próximo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{tournament.teams.length} equipos inscritos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Inicio: {new Date(tournament.startDate).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(tournament)}
                  >
                    Ver detalles
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleManageTournament(tournament)}
                  >
                    Gestionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Enrolled Teams Grid */}
      <div>
        <h2 className="text-xl mb-4">Equipos Ya Inscritos</h2>
        {enrolledTeams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No hay equipos inscritos aún
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledTeams.map((team) => {
              const tournamentName = tournaments.find((tournament) => tournament.teams.includes(team.id))?.name ?? team.tournamentId ?? "Sin torneo";

              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{team.teamName}</CardTitle>
                          <p className="text-sm text-muted-foreground">{team.sport}</p>
                        </div>
                      </div>
                      <Badge className="bg-secondary">Inscrito</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{team.players.length} jugadores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Torneo: {tournamentName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Capitán: {team.captainName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewTeamDetails(team)}
                      >
                        Ver detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleManageTeam(team)}
                      >
                        Gestionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Registrations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inscripciones Pendientes de Validación</CardTitle>
            <Badge variant="secondary">{pendingRegistrations.length} pendientes</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay inscripciones pendientes
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{registration.teamName}</h3>
                      <Badge variant="outline">{registration.sport}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Capitán: {registration.captainName}</p>
                      <p>CI: {registration.captainCI}</p>
                      <p>Teléfono: {registration.captainPhone}</p>
                      <p>Email: {registration.captainEmail}</p>
                      <p>
                        {registration.players.length} jugadores • Enviado el{" "}
                        {new Date(registration.submittedDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      size="sm" 
                      className="bg-secondary hover:bg-secondary/90 gap-2 flex-1 sm:flex-initial"
                      onClick={() => handleApprove(registration.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10 gap-2 flex-1 sm:flex-initial"
                      onClick={() => handleReject(registration.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateTournamentDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      <TournamentDetailsDialog
        tournament={selectedTournament}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        mode={tournamentDialogMode}
      />
      <TeamDetailsDialog
        team={selectedTeam}
        open={teamDetailsDialogOpen}
        onOpenChange={setTeamDetailsDialogOpen}
        mode={teamDialogMode}
      />
    </div>
  );
}