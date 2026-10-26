import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/instrument-sans";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/experience.css";
import "./styles/illustrations.css";
import App from "./App";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
