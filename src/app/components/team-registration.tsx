import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  User,
  Trophy,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";
import { useTournament } from "../context/tournament-context";
import type { Player } from "../context/tournament-context";
import { toast } from "sonner";

export function TeamRegistration() {
  const { addTeamRegistration } = useTournament();
  const [currentStep, setCurrentStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainCI, setCaptainCI] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [players, setPlayers] = useState<Player[]>([{ name: "", ci: "" }]);

  const totalSteps = 3;
  const MIN_PLAYERS = 6;
  const MAX_PLAYERS = 11;

  const addPlayer = () => {
    if (players.length < MAX_PLAYERS) {
      setPlayers([...players, { name: "", ci: "" }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: "name" | "ci", value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const canProceedStep1 = teamName.trim() !== "" && sport !== "";
  const canProceedStep2 =
    captainName.trim() !== "" &&
    captainCI.trim() !== "" &&
    captainPhone.trim() !== "" &&
    captainEmail.trim() !== "";
  const canSubmit =
    players.every((p) => p.name.trim() !== "" && p.ci.trim() !== "") &&
    players.length >= MIN_PLAYERS &&
    players.length <= MAX_PLAYERS;

  const handleSubmit = () => {
    const sportName = 
      sport === "futbol-sala" ? "Fútbol Sala" :
      sport === "baloncesto" ? "Baloncesto" :
      "Voleibol";

    addTeamRegistration({
      teamName,
      sport: sportName,
      captainName,
      captainCI,
      captainPhone,
      captainEmail,
      players,
    });

    toast.success("¡Inscripción enviada correctamente!", {
      description: `El equipo "${teamName}" será revisado por el administrador.`,
    });

    // Reset form
    setCurrentStep(1);
    setTeamName("");
    setSport("");
    setCaptainName("");
    setCaptainCI("");
    setCaptainPhone("");
    setCaptainEmail("");
    setPlayers([{ name: "", ci: "" }]);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl">Inscripción de Equipos</h1>
        <p className="text-muted-foreground mt-1">
          Completa el formulario para inscribir tu equipo en los torneos Unimar
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                step === currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : step < currentStep
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "border-gray-300 text-gray-400"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{step}</span>
              )}
            </div>
            {step < totalSteps && (
              <div
                className={`w-12 md:w-24 h-1 mx-1 transition-colors ${
                  step < currentStep ? "bg-secondary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-center gap-8 text-sm text-center">
        <div className={currentStep === 1 ? "text-primary font-medium" : "text-muted-foreground"}>
          Datos del Equipo
        </div>
        <div className={currentStep === 2 ? "text-primary font-medium" : "text-muted-foreground"}>
          Datos del Capitán
        </div>
        <div className={currentStep === 3 ? "text-primary font-medium" : "text-muted-foreground"}>
          Lista de Jugadores
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && (
              <>
                <Trophy className="h-5 w-5 text-primary" />
                Paso 1: Información del Equipo
              </>
            )}
            {currentStep === 2 && (
              <>
                <User className="h-5 w-5 text-primary" />
                Paso 2: Información del Capitán
              </>
            )}
            {currentStep === 3 && (
              <>
                <Users className="h-5 w-5 text-primary" />
                Paso 3: Jugadores del Equipo
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Team Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="teamName">Nombre del Equipo *</Label>
                <Input
                  id="teamName"
                  placeholder="Ej: Los Tigres FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Deporte / Torneo *</Label>
                <Select value={sport} onValueChange={setSport}>
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="futbol-sala">Fútbol Sala 2026</SelectItem>
                    <SelectItem value="baloncesto">Baloncesto Universitario</SelectItem>
                    <SelectItem value="voleibol">Voleibol Copa Unimar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Requisitos de inscripción:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Todos los jugadores deben ser estudiantes activos de Unimar</li>
                  <li>Mínimo {sport === "futbol-sala" ? "8" : sport === "baloncesto" ? "6" : "6"} jugadores por equipo</li>
                  <li>El capitán debe proporcionar información de contacto válida</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Captain Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="captainName">Nombre Completo del Capitán *</Label>
                <Input
                  id="captainName"
                  placeholder="Ej: Carlos Rodríguez"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captainCI">Cédula de Identidad *</Label>
                <Input
                  id="captainCI"
                  placeholder="Ej: V-12345678"
                  value={captainCI}
                  onChange={(e) => setCaptainCI(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captainPhone">Teléfono de Contacto *</Label>
                <Input
                  id="captainPhone"
                  type="tel"
                  placeholder="Ej: 0414-1234567"
                  value={captainPhone}
                  onChange={(e) => setCaptainPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captainEmail">Correo Electrónico *</Label>
                <Input
                  id="captainEmail"
                  type="email"
                  placeholder="Ej: carlos@ejemplo.com"
                  value={captainEmail}
                  onChange={(e) => setCaptainEmail(e.target.value)}
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> El capitán será el responsable de la comunicación con la
                  organización y deberá estar presente en todos los partidos.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Players List */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Lista de Jugadores</h3>
                  <p className="text-sm text-muted-foreground">
                    Mínimo {MIN_PLAYERS} jugadores, máximo {MAX_PLAYERS} jugadores
                  </p>
                </div>
                <Badge 
                  variant={players.length >= MIN_PLAYERS && players.length <= MAX_PLAYERS ? "secondary" : "destructive"}
                >
                  {players.length} / {MAX_PLAYERS} jugadores
                </Badge>
              </div>

              {players.length < MIN_PLAYERS && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Debes agregar al menos {MIN_PLAYERS} jugadores para poder enviar la inscripción.
                    Te faltan {MIN_PLAYERS - players.length} jugador(es).
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {players.map((player, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1">
                            <Label htmlFor={`player-name-${index}`} className="text-sm">
                              Nombre del Jugador *
                            </Label>
                            <Input
                              id={`player-name-${index}`}
                              placeholder="Nombre completo"
                              value={player.name}
                              onChange={(e) => updatePlayer(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`player-ci-${index}`} className="text-sm">
                              Cédula de Identidad *
                            </Label>
                            <Input
                              id={`player-ci-${index}`}
                              placeholder="V-12345678"
                              value={player.ci}
                              onChange={(e) => updatePlayer(index, "ci", e.target.value)}
                            />
                          </div>
                        </div>
                        {players.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlayer(index)}
                            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addPlayer}
                disabled={players.length >= MAX_PLAYERS}
                className="w-full gap-2 border-dashed border-2"
              >
                <Plus className="h-4 w-4" />
                {players.length >= MAX_PLAYERS 
                  ? `Máximo de ${MAX_PLAYERS} jugadores alcanzado`
                  : "Agregar Jugador"
                }
              </Button>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  Recuerda que todos los jugadores deben ser estudiantes activos de la Universidad
                  de Margarita. La organización se reserva el derecho de verificar la información.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2)
                }
                className="ml-auto gap-2 bg-primary"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="ml-auto gap-2 bg-secondary hover:bg-secondary/90"
              >
                <CheckCircle className="h-4 w-4" />
                Enviar Inscripción
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {currentStep > 1 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base">Resumen de Inscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {teamName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipo:</span>
                <span className="font-medium">{teamName}</span>
              </div>
            )}
            {sport && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Torneo:</span>
                <span className="font-medium">
                  {sport === "futbol-sala"
                    ? "Fútbol Sala 2026"
                    : sport === "baloncesto"
                    ? "Baloncesto Universitario"
                    : "Voleibol Copa Unimar"}
                </span>
              </div>
            )}
            {currentStep >= 2 && captainName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capitán:</span>
                <span className="font-medium">{captainName}</span>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jugadores:</span>
                <span className="font-medium">{players.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}