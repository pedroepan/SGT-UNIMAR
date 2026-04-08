import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useTournament } from "../context/tournament-context";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTournamentDialog({ open, onOpenChange }: CreateTournamentDialogProps) {
  const { addTournament } = useTournament();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [startDate, setStartDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sport || !startDate) return;

    try {
      await addTournament({
        name,
        sport,
        startDate,
        status: "upcoming",
      });

      toast.success("Torneo creado exitosamente", {
        description: `El torneo "${name}" de ${sport} ha sido creado.`,
      });

      setName("");
      setSport("");
      setStartDate("");
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear el torneo";
      toast.error("Error al crear torneo", { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Torneo</DialogTitle>
          <DialogDescription>
            Ingresa los detalles del nuevo torneo deportivo
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sport">Deporte *</Label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger id="sport">
                <SelectValue placeholder="Selecciona un deporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fútbol Sala">Fútbol Sala</SelectItem>
                <SelectItem value="Baloncesto">Baloncesto</SelectItem>
                <SelectItem value="Voleibol">Voleibol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Torneo *</Label>
            <Input
              id="name"
              placeholder="Ej: Fútbol Sala 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Fecha de Inicio *</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                placeholder="Selecciona una fecha"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Los fixtures se generarán automáticamente cuando se inscriban los equipos al torneo.
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name || !sport || !startDate} className="bg-accent hover:bg-accent/90">
              Crear Torneo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}