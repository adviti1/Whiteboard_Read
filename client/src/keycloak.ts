import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({ url: 'http://localhost:8080/auth', realm: 'WhiteboardApp', clientId: 'whiteboard-client'});

export default keycloak;
