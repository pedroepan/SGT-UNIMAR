import { ChangeEvent, useRef, useState } from "react";
import { Camera, Check, ImagePlus, Trash2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/auth-context";
import { useTournament } from "../context/tournament-context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface PlayerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildInitials(name?: string, email?: string) {
  return (name ?? email ?? "U")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PlayerProfileDialog({ open, onOpenChange }: PlayerProfileDialogProps) {
  const { user, updateProfilePhoto } = useAuth();
  const { getUserTeams, getUserTournaments } = useTournament();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user) {
    return null;
  }

  const userTeams = getUserTeams(user.id);
  const userTournaments = getUserTournaments(user.id);
  const isPlayer = user.rol === "jugador";
  const roleLabel = isPlayer ? "Jugador" : "Administrador";
  const initials = buildInitials(user.name, user.email);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Formato no válido", {
        description: "Selecciona una imagen para usar como foto de perfil.",
      });
      return;
    }

    setSaving(true);
    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("No se pudo leer la imagen seleccionada."));
          }
        };
        reader.onerror = () => reject(new Error("No se pudo cargar la imagen seleccionada."));
        reader.readAsDataURL(file);
      });

      await updateProfilePhoto(avatarUrl);
      toast.success("Foto actualizada", {
        description: "Tu foto de perfil quedó guardada en este dispositivo.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la foto de perfil";
      toast.error("Error al subir la foto", { description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    setSaving(true);
    try {
      await updateProfilePhoto(null);
      toast.success("Foto eliminada", {
        description: "Se quitó la foto de perfil de este usuario.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la foto";
      toast.error("Error al quitar la foto", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mi perfil</DialogTitle>
          <DialogDescription>Revisa tu equipo, tus torneos y actualiza tu foto de perfil.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 sm:items-center">
              <Avatar className="h-20 w-20 border-4 border-muted">
                <AvatarImage src={user.avatarUrl} alt={user.name ?? "Usuario"} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-lg font-medium">{user.name ?? "Usuario"}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    {roleLabel}
                  </Badge>
                  {isPlayer && (
                    <>
                      <Badge variant="secondary" className="gap-1.5">
                        <Trophy className="h-3.5 w-3.5" />
                        {userTournaments.length} torneo{userTournaments.length === 1 ? "" : "s"}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {userTeams.length} equipo{userTeams.length === 1 ? "" : "s"}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Foto de perfil</h3>
                  <p className="text-sm text-muted-foreground">La imagen se guarda solo en este navegador.</p>
                </div>
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  placeholder="Seleccionar imagen de perfil"
                  className="hidden"
                  onChange={(event) => void handleFileChange(event)}
                />
                <Button
                  type="button"
                  className="gap-2 bg-secondary hover:bg-secondary/90"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <ImagePlus className="h-4 w-4" />
                  Subir foto
                </Button>
                {user.avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleRemovePhoto()}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                    Quitar foto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isPlayer && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">Mi equipo</h3>
                    <Badge variant="outline">{userTeams.length}</Badge>
                  </div>

                  {userTeams.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Todavía no estás inscrito en un equipo.</p>
                  ) : (
                    <div className="space-y-2">
                      {userTeams.map((team) => (
                        <div key={team.id} className="rounded-lg border bg-muted/40 p-3">
                          <div className="font-medium">{team.teamName}</div>
                          <div className="text-sm text-muted-foreground">{team.sport}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{team.status === "approved" ? "Aprobado" : "Pendiente"}</Badge>
                            {team.tournamentId && <Badge variant="secondary">Inscrito al torneo</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium">Torneos en los que participas</h3>
                    <Badge variant="outline">{userTournaments.length}</Badge>
                  </div>

                  {userTournaments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aún no participas en torneos registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {userTournaments.map((tournament) => (
                        <div key={tournament.id} className="rounded-lg border bg-muted/40 p-3">
                          <div className="font-medium">{tournament.name}</div>
                          <div className="text-sm text-muted-foreground">{tournament.sport}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge variant="outline">{tournament.status}</Badge>
                            <Badge variant="secondary">
                              {tournament.teams.length} equipo{tournament.teams.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
