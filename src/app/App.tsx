import { RouterProvider } from "react-router";
import { router } from "./routes";
import { TournamentProvider } from "./context/tournament-context";
import { AuthProvider } from "./context/auth-context";

export default function App() {
  return (
    <TournamentProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </TournamentProvider>
  );
}