import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useTournament, Tournament } from "../context/tournament-context";
import { Users, Trash2, Plus, Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TournamentDetailsDialogProps {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TournamentDetailsDialog({
  tournament,
  open,
  onOpenChange,
}: TournamentDetailsDialogProps) {
  const {
    getTournamentTeams,
    getApprovedTeamsBySport,
    addTeamToTournament,
    removeTeamFromTournament,
  } = useTournament();

  const [showAddTeams, setShowAddTeams] = useState(false);

  if (!tournament) return null;

  const enrolledTeams = getTournamentTeams(tournament.id);
  const availableTeams = getApprovedTeamsBySport(tournament.sport).filter(
    (team) => !tournament.teams.includes(team.id)
  );

  const handleAddTeam = (teamId: string) => {
    const team = availableTeams.find(t => t.id === teamId);
    addTeamToTournament(tournament.id, teamId);
    toast.success("Equipo agregado", {
      description: `El equipo "${team?.teamName}" ha sido agregado al torneo.`,
    });
  };

  const handleRemoveTeam = (teamId: string) => {
    const team = enrolledTeams.find(t => t.id === teamId);
    if (confirm(`¿Deseas eliminar el equipo "${team?.teamName}" de este torneo?`)) {
      removeTeamFromTournament(tournament.id, teamId);
      toast.info("Equipo eliminado", {
        description: `El equipo "${team?.teamName}" ha sido eliminado del torneo.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle>{tournament.name}</DialogTitle>
              <DialogDescription className="text-left">
                {tournament.sport} • Inicio: {new Date(tournament.startDate).toLocaleDateString("es-ES")}
              </DialogDescription>
            </div>
            <Badge className="bg-secondary">{tournament.status === "active" ? "Activo" : "Próximo"}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enrolled Teams Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Equipos Inscritos</h3>
                <Badge variant="secondary">{enrolledTeams.length} equipos</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => setShowAddTeams(!showAddTeams)}
              >
                <Plus className="h-4 w-4" />
                Agregar Equipos
              </Button>
            </div>

            {enrolledTeams.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay equipos inscritos en este torneo
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {enrolledTeams.map((team) => (
                  <Card key={team.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{team.teamName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Capitán: {team.captainName} • {team.players.length} jugadores
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveTeam(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add Teams Section */}
          {showAddTeams && (
            <div>
              <h3 className="font-medium mb-3">Equipos Aprobados Disponibles</h3>
              {availableTeams.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No hay equipos aprobados disponibles para agregar
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {availableTeams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{team.teamName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Capitán: {team.captainName} • {team.players.length} jugadores
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-secondary hover:bg-secondary/90 gap-2"
                            onClick={() => handleAddTeam(team.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Agregar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Info Note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Los fixtures se generarán automáticamente basándose en los equipos inscritos.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}