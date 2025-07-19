
import './App.css'
import AppRoutes from './AppRoutes'
import { ReactKeycloakProvider } from "@react-keycloak/web";
import keycloak from "./KeycloakProvider";

function App() {
    const { keycloak, initialized } = useKeycloak();

      if (!initialized) {
    return <div>Loading...</div>;
  }

  return (
   <div className="text-center p-4">
      {keycloak.authenticated ? (
        <>
          <h1 className="text-2xl font-bold">Welcome, {keycloak.tokenParsed?.preferred_username}</h1>
          <button
            onClick={() => keycloak.logout()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => keycloak.login()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      )}
    </div>
  )
}

export default App
