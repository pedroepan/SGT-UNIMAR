import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Página no encontrada</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
