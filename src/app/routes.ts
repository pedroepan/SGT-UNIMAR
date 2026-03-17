import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { AdminDashboard } from "./components/admin-dashboard";
import { Fixture } from "./components/fixture";
import { TeamRegistration } from "./components/team-registration";
import { NotFound } from "./components/not-found";
import { Login } from "./components/login";
import { Signup } from "./components/signup";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "fixtures", Component: Fixture },
      { path: "registro", Component: TeamRegistration },
      { path: "*", Component: NotFound },
    ],
  },
  { path: "/login", Component: Login },
  { path: "/signup", Component: Signup },
]);
