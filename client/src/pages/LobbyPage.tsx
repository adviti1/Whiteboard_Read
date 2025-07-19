import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const LobbyPage: React.FC = () => {
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();

  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    navigate(`/whiteboard/${newSessionId}`);
  };

  const joinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionCode.trim()) {
      navigate(`/whiteboard/${sessionCode}`);
    }
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Collaborative Whiteboard</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link as="span" className="me-3">
              Welcome, {keycloak.tokenParsed?.preferred_username}
            </Nav.Link>
            <Button variant="outline-secondary" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="mb-4">
              <Card.Header>
                <h4>Create New Session</h4>
              </Card.Header>
              <Card.Body>
                <p>Start a new whiteboard session and invite others to collaborate.</p>
                <Button variant="primary" size="lg" onClick={createNewSession}>
                  Create New Whiteboard
                </Button>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h4>Join Existing Session</h4>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={joinSession}>
                  <Form.Group className="mb-3">
                    <Form.Label>Session Code</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter session code"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="success" size="lg">
                    Join Session
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LobbyPage;
