import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTournament, Match } from "../context/tournament-context";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

interface MatchResultDialogProps {
  match: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchResultDialog({ match, open, onOpenChange }: MatchResultDialogProps) {
  const { updateMatchResult } = useTournament();
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");

  if (!match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const score1 = parseInt(team1Score);
    const score2 = parseInt(team2Score);
    
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      toast.error("Error", {
        description: "Por favor ingresa marcadores válidos (números positivos)",
      });
      return;
    }

    try {
      await updateMatchResult(match.id, score1, score2);

      toast.success("Resultado registrado", {
        description: `${match.team1Name} ${score1} - ${score2} ${match.team2Name}`,
      });

      setTeam1Score("");
      setTeam2Score("");
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el resultado";
      toast.error("Error", { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Resultado</DialogTitle>
          <DialogDescription>
            Ingresa el marcador final del partido
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-primary/5 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-primary">{match.tournamentName}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(match.date).toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {match.time}
            </p>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="team1Score" className="text-center block">
                {match.team1Name}
              </Label>
              <Input
                id="team1Score"
                type="number"
                min="0"
                placeholder="0"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                className="text-center text-2xl font-bold h-16"
                required
              />
            </div>

            <div className="text-2xl font-bold pb-4">-</div>

            <div className="space-y-2">
              <Label htmlFor="team2Score" className="text-center block">
                {match.team2Name}
              </Label>
              <Input
                id="team2Score"
                type="number"
                min="0"
                placeholder="0"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                className="text-center text-2xl font-bold h-16"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-secondary hover:bg-secondary/90">
              Guardar Resultado
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
