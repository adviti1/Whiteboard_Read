// src/pages/Home.tsx
import { useKeycloak } from "@react-keycloak/web";

export default function Home() {
  const { keycloak } = useKeycloak();
  console.log("🟢 Home Component Rendered");
  return (
    <div>
      <h1>Welcome to the Whiteboard App</h1>
      {!keycloak.authenticated ? (
        <button onClick={() => keycloak.login()}>Login</button>
      ) : (
        <>
          <p>Hello, {keycloak.tokenParsed?.preferred_username}</p>
          <button onClick={() => keycloak.logout()}>Logout</button>
        </>
      )}
    </div>
  );
}
