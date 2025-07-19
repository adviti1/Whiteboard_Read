import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Button, ButtonGroup, Form, Row, Col, Card } from 'react-bootstrap';
import { Socket } from 'socket.io-client';

interface WhiteboardCanvasProps {
  socket: Socket;
  sessionId: string;
  userId: string;
  username: string;
}

const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  socket,
  sessionId,
  userId,
  username
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [brushWidth, setBrushWidth] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'select'>('pen');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      height: 600,
      width: 1000,
      backgroundColor: 'white'
    });

    fabricCanvasRef.current = canvas;

    // Set initial brush settings
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = brushColor;
    }
    canvas.isDrawingMode = true;

    const emitCanvasUpdate = () => {
      const canvasData = JSON.stringify(canvas.toJSON());
      socket.emit('drawing-event', {
        roomId: sessionId,
        type: 'canvas-update',
        data: canvasData,
        userId
      });
    };

    canvas.on('path:created', emitCanvasUpdate);
    canvas.on('object:modified', emitCanvasUpdate);
    canvas.on('mouse:move', (e: any) => {
      const pointer = canvas.getPointer(e.e);
      socket.emit('cursor-move', {
        roomId: sessionId,
        x: pointer.x,
        y: pointer.y,
        userId,
        username
      });
    });

    socket.on('drawing-event', (data) => {
      if (data.userId !== userId) {
        canvas.loadFromJSON(data.data, canvas.renderAll.bind(canvas));
      }
    });

    socket.on('cursor-move', (data) => {
      if (data.userId !== userId) {
        console.log(`${data.username} cursor at:`, data.x, data.y);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [socket, sessionId, userId, username, brushWidth, brushColor]); // Added missing dependencies

  // Brush updates
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.freeDrawingBrush.color = brushColor;
    }
  }, [brushWidth, brushColor]);

  const handleToolChange = (tool: 'pen' | 'eraser' | 'select') => {
    setCurrentTool(tool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    switch (tool) {
      case 'pen':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = brushColor;
        break;
      case 'eraser':
        canvas.isDrawingMode = true;
        if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = 'white';
        break;
      case 'select':
        canvas.isDrawingMode = false;
        break;
    }
  };

  const clearCanvas = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = 'white';
      canvas.renderAll();

      socket.emit('drawing-event', {
        roomId: sessionId,
        type: 'clear-canvas',
        data: JSON.stringify(canvas.toJSON()),
        userId
      });
    }
  };

  const saveAsImage = () => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      link.download = `whiteboard-${sessionId}.png`;
      link.click();
    }
  };

  return (
    <div className="whiteboard-container">
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={3}>
              <ButtonGroup>
                <Button
                  variant={currentTool === 'pen' ? 'primary' : 'outline-primary'}
                  onClick={() => handleToolChange('pen')}
                >
                  ✏️ Pen
                </Button>
                <Button
                  variant={currentTool === 'eraser' ? 'primary' : 'outline-primary'}
                  onClick={() => handleToolChange('eraser')}
                >
                  🧹 Eraser
                </Button>
                <Button
                  variant={currentTool === 'select' ? 'primary' : 'outline-primary'}
                  onClick={() => handleToolChange('select')}
                >
                  👆 Select
                </Button>
              </ButtonGroup>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Color:</Form.Label>
                <Form.Control
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  disabled={currentTool === 'eraser'}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Size: {brushWidth}px</Form.Label>
                <Form.Range
                  min={1}
                  max={50}
                  value={brushWidth}
                  onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <ButtonGroup>
                <Button variant="warning" onClick={clearCanvas}>🗑️ Clear</Button>
                <Button variant="success" onClick={saveAsImage}>💾 Save</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="canvas-container border rounded p-2 bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default WhiteboardCanvas;
