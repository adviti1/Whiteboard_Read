import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

import LoginPage from './pages/LoginPage';
import LobbyPage from './pages/LobbyPage';
import WhiteboardPage from './pages/WhiteboardPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { keycloak } = useKeycloak();

  return keycloak.authenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();

  console.log("Keycloak initialized:", initialized);
  console.log("Keycloak authenticated:", keycloak?.authenticated);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-600 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/lobby"
          element={
            <PrivateRoute>
              <LobbyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/whiteboard/:sessionId"
          element={
            <PrivateRoute>
              <WhiteboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            keycloak.authenticated ? (
              <Navigate to="/lobby" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
