import { useEffect, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
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
  FileUp,
  Download,
  Search,
  Check,
  UserRound,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/auth-context";
import { useTournament } from "../context/tournament-context";
import type { Player } from "../context/tournament-context";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";

type RegisteredCaptainOption = {
  id: string;
  name: string;
  ci: string;
  email: string;
};

const PLAYER_FILE_ACCEPT = ".csv,.txt,text/csv,text/plain";

function isHeaderRow(row: string) {
  const normalized = row.toLowerCase();
  return normalized.includes("nombre") && (normalized.includes("cedula") || normalized.includes("cédula") || normalized.includes("ci"));
}

function parsePlayerRow(row: string): Player | null {
  const cleaned = row.replace(/^\uFEFF/, "").trim();

  if (!cleaned || isHeaderRow(cleaned)) {
    return null;
  }

  const delimiterParts = cleaned.includes(",") || cleaned.includes(";") || cleaned.includes("|") || cleaned.includes("\t")
    ? cleaned.split(/[;,|\t]+/).map((part) => part.trim()).filter(Boolean)
    : cleaned.split(/\s+/).map((part) => part.trim()).filter(Boolean);

  if (delimiterParts.length < 2) {
    return null;
  }

  const ci = delimiterParts[delimiterParts.length - 1];
  const name = delimiterParts.slice(0, -1).join(" ").trim();

  if (!name || !ci) {
    return null;
  }

  return { name, ci };
}

function parsePlayersFile(content: string): Player[] {
  const rows = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  return rows.map(parsePlayerRow).filter((player): player is Player => player !== null);
}

export function TeamRegistration() {
  const { addTeamRegistration, tournaments } = useTournament();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("");
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [captainCI, setCaptainCI] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [captainEmail, setCaptainEmail] = useState("");
  const [captainUserId, setCaptainUserId] = useState<string | null>(null);
  const [captainPickerOpen, setCaptainPickerOpen] = useState(false);
  const [captainSearch, setCaptainSearch] = useState("");
  const [registeredCaptains, setRegisteredCaptains] = useState<RegisteredCaptainOption[]>([]);
  const [captainsLoading, setCaptainsLoading] = useState(false);
  const [captainsLoaded, setCaptainsLoaded] = useState(false);
  const [captainsLoadError, setCaptainsLoadError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([{ name: "", ci: "" }]);
  const [playersFileName, setPlayersFileName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRegisteredCaptains = async () => {
      if (captainsLoaded || !captainPickerOpen || currentStep !== 2) return;

      setCaptainsLoading(true);
      setCaptainsLoadError(null);

      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nombre, correo, cedula, rol")
          .eq("rol", "jugador")
          .order("nombre", { ascending: true });

        if (!active) return;

        if (error) {
          setRegisteredCaptains([]);
          setCaptainsLoadError(error.message);
          setCaptainsLoading(false);
          return;
        }

        setRegisteredCaptains(
          (data ?? []).map((player) => ({
            id: String(player.id),
            name: String(player.nombre ?? ""),
            ci: String(player.cedula ?? ""),
            email: String(player.correo ?? ""),
          })),
        );
        setCaptainsLoaded(true);
        setCaptainsLoading(false);
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : "No se pudo cargar la lista de jugadores";
        setRegisteredCaptains([]);
        setCaptainsLoadError(message);
        setCaptainsLoading(false);
      }
    };

    void loadRegisteredCaptains();

    return () => {
      active = false;
    };
  }, [captainPickerOpen, currentStep, captainsLoaded]);

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

  const clearSelectedCaptain = () => {
    setCaptainUserId(null);
  };

  const selectRegisteredCaptain = (player: RegisteredCaptainOption) => {
    setCaptainUserId(player.id);
    setCaptainName(player.name);
    setCaptainCI(player.ci);
    setCaptainEmail(player.email);
    setCaptainPickerOpen(false);
    setCaptainSearch("");
  };

  const filteredRegisteredCaptains = registeredCaptains.filter((player) => {
    const haystack = `${player.name} ${player.ci} ${player.email}`.toLowerCase();
    return haystack.includes(captainSearch.toLowerCase().trim());
  });

  const handlePlayersFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const isSupported = file.name.toLowerCase().endsWith(".csv") || file.name.toLowerCase().endsWith(".txt");
    if (!isSupported) {
      toast.error("Archivo no compatible", {
        description: "Solo se admiten archivos .csv o .txt.",
      });
      return;
    }

    try {
      const content = await file.text();
      const importedPlayers = parsePlayersFile(content);

      if (importedPlayers.length === 0) {
        throw new Error("No se encontraron jugadores válidos. Usa una línea por jugador con nombre y cédula.");
      }

      if (importedPlayers.length > MAX_PLAYERS) {
        throw new Error(`El archivo contiene ${importedPlayers.length} jugadores y el máximo permitido es ${MAX_PLAYERS}.`);
      }

      setPlayers(importedPlayers);
      setPlayersFileName(file.name);

      toast.success("Archivo cargado correctamente", {
        description: `${importedPlayers.length} jugadores importados desde ${file.name}.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo leer el archivo.";
      toast.error("Error al importar jugadores", { description: message });
    }
  };

  const downloadPlayersTemplate = (format: "csv" | "txt") => {
    const fileName = `plantilla-jugadores.${format}`;
    const content =
      format === "csv"
        ? "Nombre,Cedula\nJuan Perez,V-12345678\nMaria Gomez,V-87654321\n"
        : "Juan Perez, V-12345678\nMaria Gomez, V-87654321\n";

    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const availableSports = [...new Set(tournaments.map((t) => t.sport))].sort((a, b) => a.localeCompare(b));
  const tournamentsBySport = tournaments.filter((t) => t.sport === sport);
  const selectedTournament = tournaments.find((t) => t.id === selectedTournamentId) ?? null;

  const canProceedStep1 = teamName.trim() !== "" && sport !== "" && selectedTournamentId !== "";
  const canProceedStep2 =
    captainName.trim() !== "" &&
    captainCI.trim() !== "" &&
    captainPhone.trim() !== "" &&
    captainEmail.trim() !== "";
  const hasCaptain = captainName.trim() !== "" && captainCI.trim() !== "";
  const totalTeamPlayers = players.length + (hasCaptain ? 1 : 0);
  const maxAdditionalPlayers = MAX_PLAYERS - (hasCaptain ? 1 : 0);
  const canSubmit =
    canProceedStep2 &&
    players.every((p) => p.name.trim() !== "" && p.ci.trim() !== "") &&
    totalTeamPlayers >= MIN_PLAYERS &&
    totalTeamPlayers <= MAX_PLAYERS;

  const selectedSportName = sport;
  const selectedTournamentName = selectedTournament?.name ?? "";

  const handleSubmit = async () => {
    try {
      await addTeamRegistration({
        teamName,
        sport: selectedSportName,
        tournamentId: selectedTournamentId,
        requesterRole: user?.rol ?? "jugador",
        captainName,
        captainCI,
        captainPhone,
        captainEmail,
        captainUserId: captainUserId ?? undefined,
        players,
      });

      toast.success("¡Inscripción enviada correctamente!", {
        description: `El equipo "${teamName}" será revisado por el administrador.`,
      });

      setCurrentStep(1);
      setTeamName("");
      setSport("");
      setSelectedTournamentId("");
      setCaptainName("");
      setCaptainCI("");
      setCaptainPhone("");
      setCaptainEmail("");
      setCaptainUserId(null);
      setCaptainPickerOpen(false);
      setCaptainSearch("");
      setPlayers([{ name: "", ci: "" }]);
      setConfirmOpen(false);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar la inscripción";
      toast.error("Error al inscribir equipo", { description: message });
      return false;
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    await handleSubmit();
    setIsSubmitting(false);
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
                <Label htmlFor="sport">Deporte *</Label>
                <Select
                  value={sport}
                  onValueChange={(value) => {
                    setSport(value);
                    setSelectedTournamentId("");
                  }}
                >
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSports.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No hay deportes con torneos creados.
                      </div>
                    ) : (
                      availableSports.map((sportOption) => (
                        <SelectItem key={sportOption} value={sportOption}>
                          {sportOption}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tournament">Torneo *</Label>
                <Select
                  value={selectedTournamentId}
                  onValueChange={setSelectedTournamentId}
                  disabled={!sport}
                >
                  <SelectTrigger id="tournament">
                    <SelectValue
                      placeholder={sport ? "Selecciona un torneo" : "Primero selecciona un deporte"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {tournamentsBySport.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No hay torneos creados para este deporte.
                      </div>
                    ) : (
                      tournamentsBySport.map((tournament) => (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          {tournament.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Card className="border-dashed bg-slate-50/80">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Cargar jugadores desde archivo</h3>
                      <p className="text-sm text-muted-foreground">
                        Sube un archivo .csv o .txt con una fila por jugador en formato nombre y cédula.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="playersFile" className="cursor-pointer">
                      Archivo CSV o TXT
                    </Label>
                    <Input
                      id="playersFile"
                      type="file"
                      accept={PLAYER_FILE_ACCEPT}
                      onChange={handlePlayersFileUpload}
                      className="cursor-pointer file:cursor-pointer"
                    />
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    Formatos admitidos: <span className="font-medium">Juan Pérez, V-12345678</span>, <span className="font-medium">Juan Pérez;V-12345678</span> o una fila por espacio/tab. También se ignora una fila de encabezado con nombre y cédula.
                    <span className="mt-2 block font-semibold text-slate-900">
                      Importante: no incluyas al capitán en el archivo; su información se completa manualmente en el formulario.
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer gap-2"
                      onClick={() => downloadPlayersTemplate("csv")}
                    >
                      <Download className="h-4 w-4" />
                      Descargar plantilla CSV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer gap-2"
                      onClick={() => downloadPlayersTemplate("txt")}
                    >
                      <Download className="h-4 w-4" />
                      Descargar plantilla TXT
                    </Button>
                  </div>

                  {playersFileName && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                      <span className="truncate">Archivo cargado: {playersFileName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-emerald-900 transition-colors hover:bg-orange-500 hover:text-white"
                        onClick={() => {
                          setPlayers([{ name: "", ci: "" }]);
                          setPlayersFileName("");
                        }}
                      >
                        Limpiar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Requisitos de inscripción:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Todos los jugadores deben ser estudiantes activos de Unimar</li>
                  <li>Mínimo {MIN_PLAYERS} jugadores por equipo</li>
                  <li>El capitán debe proporcionar información de contacto válida</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Captain Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="relative space-y-2">
                <Label>Buscar capitán en jugadores registrados</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer justify-between gap-2"
                  onClick={() => setCaptainPickerOpen((current) => !current)}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate">
                    <Search className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {captainUserId ? `Capitán seleccionado: ${captainName}` : "Buscar capitán en la lista"}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {captainsLoading ? "Cargando..." : `${registeredCaptains.length} jugadores`}
                    <ChevronDown className={`h-4 w-4 transition-transform ${captainPickerOpen ? "rotate-180" : ""}`} />
                  </span>
                </Button>

                {captainPickerOpen && (
                  <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-2xl">
                    <div className="space-y-3">
                      {captainsLoadError && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                          No se pudo cargar la lista de jugadores. {captainsLoadError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="captain-search" className="text-xs font-medium text-slate-600">
                          Buscar por nombre, cédula o correo
                        </Label>
                        <Input
                          id="captain-search"
                          value={captainSearch}
                          onChange={(e) => setCaptainSearch(e.target.value)}
                          placeholder="Escribe para filtrar..."
                          className="cursor-text"
                        />
                      </div>

                      <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
                        {captainsLoading ? (
                          <div className="px-3 py-4 text-sm text-slate-600">Cargando jugadores...</div>
                        ) : filteredRegisteredCaptains.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-slate-600">No se encontraron jugadores registrados.</div>
                        ) : (
                          filteredRegisteredCaptains.map((player) => {
                            const isSelected = captainUserId === player.id;

                            return (
                              <button
                                key={player.id}
                                type="button"
                                onClick={() => selectRegisteredCaptain(player)}
                                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50"
                              >
                                <UserRound className="h-4 w-4 shrink-0 text-slate-500" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium text-slate-900">{player.name}</div>
                                  <div className="truncate text-xs text-slate-500">{player.ci}</div>
                                </div>
                                {isSelected && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                              </button>
                            );
                          })
                        )}
                      </div>

                      {captainUserId && (
                        <p className="text-xs font-medium text-emerald-700">
                          Se usará un jugador ya registrado como capitán.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="captainName">Nombre Completo del Capitán *</Label>
                <Input
                  id="captainName"
                  placeholder="Ej: Carlos Rodríguez"
                  value={captainName}
                  onChange={(e) => {
                    clearSelectedCaptain();
                    setCaptainName(e.target.value);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="captainCI">Cédula de Identidad *</Label>
                <Input
                  id="captainCI"
                  placeholder="Ej: V-12345678"
                  value={captainCI}
                  onChange={(e) => {
                    clearSelectedCaptain();
                    setCaptainCI(e.target.value);
                  }}
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
                  type="text"
                  placeholder="Ej: carlos@ejemplo.com"
                  value={captainEmail}
                  onChange={(e) => {
                    clearSelectedCaptain();
                    setCaptainEmail(e.target.value);
                  }}
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
                  variant={totalTeamPlayers >= MIN_PLAYERS && totalTeamPlayers <= MAX_PLAYERS ? "secondary" : "destructive"}
                >
                  {totalTeamPlayers} / {MAX_PLAYERS} jugadores
                </Badge>
              </div>

              {totalTeamPlayers < MIN_PLAYERS && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Advertencia:</strong> Debes agregar al menos {MIN_PLAYERS} jugadores para poder enviar la inscripción.
                    Te faltan {MIN_PLAYERS - totalTeamPlayers} jugador(es).
                  </p>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {hasCaptain && (
                  <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          C
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{captainName}</p>
                          <p className="text-sm text-muted-foreground">{captainCI}</p>
                          <p className="text-xs text-primary font-medium">Capitán (agregado desde Paso 2)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
                disabled={players.length >= maxAdditionalPlayers}
                className="w-full gap-2 border-dashed border-2"
              >
                <Plus className="h-4 w-4" />
                {players.length >= maxAdditionalPlayers 
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
                onClick={() => setConfirmOpen(true)}
                disabled={!canSubmit}
                className="ml-auto gap-2 bg-secondary hover:bg-secondary/90"
              >
                <CheckCircle className="h-4 w-4" />
                Revisar y Enviar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inscripción del Equipo</AlertDialogTitle>
            <AlertDialogDescription>
              Revisa el resumen final antes de enviar la solicitud de inscripción.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 text-sm">
            <div className="grid gap-2 rounded-lg border bg-slate-50 p-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Equipo</p>
                <p className="font-medium">{teamName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deporte</p>
                <p className="font-medium">{selectedSportName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Torneo</p>
                <p className="font-medium">{selectedTournamentName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Jugadores</p>
                <p className="font-medium">{totalTeamPlayers}</p>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Capitán</p>
              <p className="font-medium">{captainName}</p>
              <p className="text-muted-foreground">{captainCI}</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-2 text-xs text-muted-foreground">Jugadores del equipo</p>
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                <div className="rounded-md bg-primary/5 px-3 py-2">
                  <p className="font-medium">{captainName} (Capitán)</p>
                  <p className="text-xs text-muted-foreground">{captainCI}</p>
                </div>
                {players.map((player, index) => (
                  <div key={`${player.ci}-${index}`} className="rounded-md border px-3 py-2">
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-muted-foreground">{player.ci}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Volver</AlertDialogCancel>
            <Button
              type="button"
              onClick={() => void handleConfirmSubmit()}
              disabled={isSubmitting}
              className="bg-secondary hover:bg-secondary/90"
            >
              {isSubmitting ? "Enviando..." : "Confirmar y Enviar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                <span className="text-muted-foreground">Deporte:</span>
                <span className="font-medium">{sport}</span>
              </div>
            )}
            {selectedTournamentName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Torneo:</span>
                <span className="font-medium">{selectedTournamentName}</span>
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
                <span className="font-medium">{totalTeamPlayers}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}