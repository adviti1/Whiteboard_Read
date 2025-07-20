import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak'; // Import from separate file
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
 
<ReactKeycloakProvider
  authClient={keycloak}
  initOptions={{
    onLoad: 'check-sso',
    checkLoginIframe: false,
    redirectUri: window.location.origin
  }}
  LoadingComponent={<div>Loading auth…</div>}
>
  <App />
</ReactKeycloakProvider>
);




