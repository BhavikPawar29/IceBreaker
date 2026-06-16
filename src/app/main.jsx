import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { AuthProvider } from "../shared/auth/AuthContext";
import { installShareRuntime } from "../shared/core/shareRuntime";
import "../shared/styles/tokens.css";
import "../shared/styles/base.css";
import "../shared/styles/shell.css";
import "../shared/styles/ui.css";
import "../features/landing/styles/landing.css";
import "../features/auth/styles/auth.css";
import "../features/live/styles/live.css";
import "../features/board/styles/board.css";
import "../features/create/styles/create.css";
import "../features/profile/styles/profile.css";
import "../features/admin/styles/admin.css";
import "../features/legal/styles/legal.css";

installShareRuntime();
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
