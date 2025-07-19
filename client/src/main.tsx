import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./KeycloakProvider.ts";

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
    <ReactKeycloakProvider authClient={keycloak}>
      <App />
    </ReactKeycloakProvider>
  </React.StrictMode>
)
