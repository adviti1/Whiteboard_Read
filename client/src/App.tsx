import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import WhiteboardPage from './pages/WhiteboardPage';

const PrivateRoute: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    // Still initializing
    return <div>Authenticating…</div>;
  }

  if (!keycloak.authenticated) {
    // Trigger Keycloak login and render nothing while redirecting
    keycloak.login();
    return null;
  }

  // Authenticated — render child routes
  return <Outlet />;
};

const App: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();

  console.log('Keycloak initialized:', initialized);
  console.log('Keycloak authenticated:', keycloak?.authenticated);

  if (!initialized) {
    return <div>Authenticating…</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* All routes below require authentication */}
        <Route element={<PrivateRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/whiteboard/:sessionId" element={<WhiteboardPage />} />
        </Route>

        {/* Root: redirect based on auth state */}
        <Route
          path="/"
          element={
            keycloak.authenticated
              ? <Navigate to="/lobby" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Catch-all: redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
