import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Container, Card, Button } from 'react-bootstrap';

const LoginPage: React.FC = () => {
  const { keycloak } = useKeycloak();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4" style={{ width: '400px' }}>
        <Card.Body className="text-center">
          <h2 className="mb-4">Collaborative Whiteboard</h2>
          <p className="text-muted mb-4">
            Create and collaborate on whiteboards with real-time image classification
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-100"
            onClick={() => keycloak.login()}
          >
            Login with Keycloak
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;
