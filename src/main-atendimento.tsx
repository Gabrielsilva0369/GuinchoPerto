import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initClickLog } from "./lib/clickLog";
import "./styles/global.css";

initClickLog();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App phone="atendimento" />
  </StrictMode>
);
