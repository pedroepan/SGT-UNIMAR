import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useTournament, Tournament } from "../context/tournament-context";
import { Users, Trash2, Plus, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TournamentDetailsDialogProps {
  tournament: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "manage";
}

export function TournamentDetailsDialog({
  tournament,
  open,
  onOpenChange,
  mode = "view",
}: TournamentDetailsDialogProps) {
  const {
    getTournamentTeams,
    getApprovedTeamsBySport,
    addTeamToTournament,
    removeTeamFromTournament,
    updateTournament,
    deleteTournament,
  } = useTournament();

  const [showAddTeams, setShowAddTeams] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingSport, setEditingSport] = useState("");
  const [editingStatus, setEditingStatus] = useState<Tournament["status"]>("upcoming");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tournament) return;
    setEditingName(tournament.name);
    setEditingSport(tournament.sport);
    setEditingStatus(tournament.status);
    setShowAddTeams(false);
  }, [tournament, open]);

  if (!tournament) return null;

  const isManageMode = mode === "manage";

  const enrolledTeams = getTournamentTeams(tournament.id);
  const availableTeams = getApprovedTeamsBySport(tournament.sport).filter(
    (team) => !tournament.teams.includes(team.id)
  );

  const handleAddTeam = async (teamId: string) => {
    const team = availableTeams.find(t => t.id === teamId);
    try {
      await addTeamToTournament(tournament.id, teamId);
      toast.success("Equipo agregado", {
        description: `El equipo "${team?.teamName}" ha sido agregado al torneo.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo agregar equipo";
      toast.error("Error al agregar equipo", { description: message });
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    const team = enrolledTeams.find(t => t.id === teamId);
    if (confirm(`¿Deseas eliminar el equipo "${team?.teamName}" de este torneo?`)) {
      try {
        await removeTeamFromTournament(tournament.id, teamId);
        toast.info("Equipo eliminado", {
          description: `El equipo "${team?.teamName}" ha sido eliminado del torneo.`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo eliminar equipo";
        toast.error("Error al eliminar equipo", { description: message });
      }
    }
  };

  const handleSaveTournament = async () => {
    if (!editingName.trim() || !editingSport.trim()) return;

    setSaving(true);
    try {
      await updateTournament(tournament.id, {
        name: editingName.trim(),
        sport: editingSport.trim(),
        status: editingStatus,
      });

      toast.success("Torneo actualizado", {
        description: `Se guardaron los cambios de "${editingName}".`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el torneo";
      toast.error("Error al actualizar torneo", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!confirm(`¿Seguro que deseas eliminar el torneo "${tournament.name}"?`)) {
      return;
    }

    setSaving(true);
    try {
      await deleteTournament(tournament.id);
      toast.success("Torneo eliminado", {
        description: `El torneo "${tournament.name}" fue eliminado.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el torneo";
      toast.error("Error al eliminar torneo", { description: message });
    } finally {
      setSaving(false);
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
          {isManageMode && (
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium">Editar datos del torneo</h3>

                <div className="space-y-2">
                  <Label htmlFor="edit-tournament-name">Nombre del torneo</Label>
                  <Input
                    id="edit-tournament-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Ej: Torneo Apertura 2026"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tournament-sport">Deporte</Label>
                  <Input
                    id="edit-tournament-sport"
                    value={editingSport}
                    onChange={(e) => setEditingSport(e.target.value)}
                    placeholder="Ej: Fútbol Sala"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={editingStatus}
                    onValueChange={(value) => setEditingStatus(value as Tournament["status"])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="upcoming">Próximo</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => void handleDeleteTournament()}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar torneo
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => void handleSaveTournament()}
                    disabled={saving || !editingName.trim() || !editingSport.trim()}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrolled Teams Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Equipos Inscritos</h3>
                <Badge variant="secondary">{enrolledTeams.length} equipos</Badge>
              </div>
              {isManageMode && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowAddTeams(!showAddTeams)}
                >
                  <Plus className="h-4 w-4" />
                  Agregar Equipos
                </Button>
              )}
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
                        {isManageMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add Teams Section */}
          {isManageMode && showAddTeams && (
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