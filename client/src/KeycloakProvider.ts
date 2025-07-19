
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080", // Keycloak server URL
  realm: "whiteboard-realm",   // The realm you created
  clientId: "whiteboard-client", // The client ID you created
});

export default keycloak;
