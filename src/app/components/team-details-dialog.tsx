import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Calendar, Clock, Trash2, Plus } from "lucide-react";

import { useTournament, type TeamRegistration } from "../context/tournament-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

interface TeamDetailsDialogProps {
  team: TeamRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "view" | "manage";
}

export function TeamDetailsDialog({
  team,
  open,
  onOpenChange,
  mode = "view",
}: TeamDetailsDialogProps) {
  const {
    tournaments,
    teamRegistrations,
    removeTeamFromTournament,
    addPlayerToTeam,
    removePlayerFromTeam,
    rejectTeam,
  } = useTournament();
  const [saving, setSaving] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerCi, setNewPlayerCi] = useState("");

  useEffect(() => {
    if (!open) {
      setSaving(false);
      setNewPlayerName("");
      setNewPlayerCi("");
    }
  }, [open]);

  if (!team) return null;

  const isManageMode = mode === "manage";
  const currentTeam = teamRegistrations.find((entry) => entry.id === team.id) ?? team;
  const tournamentName =
    tournaments.find((tournament) => tournament.teams.includes(currentTeam.id))?.name ??
    (currentTeam.tournamentId ? tournaments.find((tournament) => tournament.id === currentTeam.tournamentId)?.name : null) ??
    "Sin torneo";

  const currentPlayers = currentTeam.players;

  const handleRemoveFromTournament = async () => {
    if (!currentTeam.tournamentId) {
      toast.error("Equipo sin torneo", {
        description: "Este equipo no tiene un torneo asignado.",
      });
      return;
    }

    if (!confirm(`¿Deseas quitar al equipo \"${currentTeam.teamName}\" del torneo?`)) {
      return;
    }

    setSaving(true);
    try {
      await removeTeamFromTournament(currentTeam.tournamentId, currentTeam.id);
      toast.success("Equipo retirado", {
        description: `El equipo \"${currentTeam.teamName}\" fue removido del torneo.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo quitar el equipo del torneo";
      toast.error("Error al gestionar equipo", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`¿Seguro que deseas eliminar completamente el equipo "${currentTeam.teamName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setSaving(true);
    try {
      await rejectTeam(currentTeam.id);
      toast.success("Equipo eliminado", {
        description: `El equipo "${currentTeam.teamName}" fue eliminado del sistema.`,
      });
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el equipo";
      toast.error("Error al eliminar equipo", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlayer = async () => {
    const playerName = newPlayerName.trim();
    const playerCi = newPlayerCi.trim();

    if (!playerName || !playerCi) {
      toast.error("Faltan datos", {
        description: "Escribe el nombre y la cédula del jugador.",
      });
      return;
    }

    setSaving(true);
    try {
      await addPlayerToTeam(currentTeam.id, { name: playerName, ci: playerCi });
      toast.success("Jugador agregado", {
        description: `${playerName} fue agregado al equipo.`,
      });
      setNewPlayerName("");
      setNewPlayerCi("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo agregar el jugador";
      toast.error("Error al agregar jugador", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePlayer = async (playerCi: string, playerName: string) => {
    if (!confirm(`¿Deseas eliminar al jugador \"${playerName}\" del equipo?`)) {
      return;
    }

    setSaving(true);
    try {
      await removePlayerFromTeam(currentTeam.id, playerCi);
      toast.success("Jugador eliminado", {
        description: `${playerName} fue removido del equipo.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el jugador";
      toast.error("Error al eliminar jugador", { description: message });
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
              <DialogTitle>{team.teamName}</DialogTitle>
              <DialogDescription className="text-left">
                {currentTeam.sport} • {currentTeam.status === "approved" ? "Aprobado" : "Pendiente"}
              </DialogDescription>
            </div>
            <Badge className="bg-secondary">Inscrito</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Torneo</p>
                  <p className="font-medium">{tournamentName}</p>
                </div>
                <Badge variant="outline">{currentPlayers.length} jugadores</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Capitán: {currentTeam.captainName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>CI: {currentTeam.captainCI || "No registrada"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Teléfono: {currentTeam.captainPhone || "No registrado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Email: {currentTeam.captainEmail || "No registrado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {isManageMode && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium">Agregar jugador</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      value={newPlayerName}
                      onChange={(event) => setNewPlayerName(event.target.value)}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={newPlayerCi}
                      onChange={(event) => setNewPlayerCi(event.target.value)}
                      placeholder="Cédula"
                    />
                  </div>
                </div>
                <Button
                  className="bg-secondary hover:bg-secondary/90 gap-2"
                  onClick={() => void handleAddPlayer()}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4" />
                  Agregar jugador
                </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <h3 className="font-medium mb-3">Jugadores</h3>
            <div className="space-y-2">
              {currentPlayers.map((player) => (
                <Card key={`${player.ci}-${player.name}`}>
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium">{player.name}</span>
                      <div className="text-sm text-muted-foreground">CI: {player.ci}</div>
                    </div>
                    {isManageMode && player.ci !== currentTeam.captainCI && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => void handleRemovePlayer(player.ci, player.name)}
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {isManageMode && (
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => void handleRemoveFromTournament()}
                  disabled={saving || !currentTeam.tournamentId}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Quitar del torneo
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => void handleDeleteTeam()}
                  disabled={saving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar equipo
                </Button>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cerrar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}