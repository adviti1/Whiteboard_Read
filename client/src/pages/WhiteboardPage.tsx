import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Navbar, Nav, Button, Card, ListGroup } from 'react-bootstrap';
import { useKeycloak } from '@react-keycloak/web';
import io, { Socket } from 'socket.io-client';
import WhiteboardCanvas from '../components/WhiteboardCanvas';
import ImageUpload from '../components/ImageUpload';

interface User {
  id: string;
  username: string;
}

const WhiteboardPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  const username = keycloak.tokenParsed?.preferred_username || 'Anonymous';
  const userId = keycloak.subject || 'unknown';

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus('connected');
      
      // Join the whiteboard session
      newSocket.emit('join-room', {
        roomId: sessionId,
        username
      });
    });

    newSocket.on('connect_error', () => {
      setConnectionStatus('error');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('connecting');
    });

    // Room event handlers
    newSocket.on('room-state', (data) => {
      setConnectedUsers(data.users || []);
    });

    newSocket.on('user-joined', (user: User) => {
      setConnectedUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', (user: User) => {
      setConnectedUsers(prev => prev.filter(u => u.id !== user.id));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, username]);

  const handleExitSession = () => {
    if (socket) {
      socket.disconnect();
    }
    navigate('/lobby');
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionId || '');
  };

  const handlePredictionResult = (result: any) => {
    console.log('Image classification result:', result);
    // You could add the result to the whiteboard as text or annotation
  };

  if (!sessionId) {
    return <div>Invalid session</div>;
  }

  return (
    <>
      <Navbar bg="light" className="mb-3">
        <Container fluid>
          <Navbar.Brand>
            Whiteboard Session: {sessionId}
          </Navbar.Brand>
          <Nav className="ms-auto align-items-center">
            <div className={`me-3 badge ${connectionStatus === 'connected' ? 'bg-success' : connectionStatus === 'error' ? 'bg-danger' : 'bg-warning'}`}>
              {connectionStatus === 'connected' ? '🟢 Connected' : 
               connectionStatus === 'error' ? '🔴 Connection Error' : 
               '🟡 Connecting...'}
            </div>
            <Button variant="outline-primary" onClick={copySessionCode} className="me-2">
              📋 Copy Code
            </Button>
            <Button variant="outline-danger" onClick={handleExitSession}>
              🚪 Exit Session
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container fluid>
        <Row>
          <Col md={9}>
            {socket && (
              <WhiteboardCanvas
                socket={socket}
                sessionId={sessionId}
                userId={userId}
                username={username}
              />
            )}
          </Col>
          
          <Col md={3}>
            {/* Connected Users */}
            <Card className="mb-3">
              <Card.Header>
                <h6>Connected Users ({connectedUsers.length})</h6>
              </Card.Header>
              <Card.Body>
                {connectedUsers.length > 0 ? (
                  <ListGroup variant="flush">
                    {connectedUsers.map((user) => (
                      <ListGroup.Item key={user.id} className="px-0">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle me-2"
                            style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: user.id === userId ? '#28a745' : '#6c757d'
                            }}
                          />
                          {user.username} {user.id === userId && '(You)'}
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted">No users connected</p>
                )}
              </Card.Body>
            </Card>

            {/* Image Classification */}
            <ImageUpload onPredictionResult={handlePredictionResult} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WhiteboardPage;
