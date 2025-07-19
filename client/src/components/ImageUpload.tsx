import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';

interface ImageUploadProps {
  onPredictionResult?: (result: any) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onPredictionResult }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setPrediction(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
      
      if (onPredictionResult) {
        onPredictionResult(result);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to classify image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPrediction(null);
    setError('');
    setImagePreview('');
  };

  return (
    <Card>
      <Card.Header>
        <h5>Image Classification</h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Select an image to classify:</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
          />
        </Form.Group>

        {imagePreview && (
          <div className="mb-3 text-center">
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '5px'
              }}
            />
          </div>
        )}

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          {selectedFile && (
            <Button variant="outline-secondary" onClick={reset} disabled={loading}>
              Reset
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Classifying...
              </>
            ) : (
              'Classify Image'
            )}
          </Button>
        </div>

        {loading && <ProgressBar animated now={100} className="mt-2" />}

        {prediction && (
          <Alert variant="success" className="mt-3">
            <Alert.Heading>Classification Result</Alert.Heading>
            <hr />
            <p>
              <strong>Predicted Class:</strong> {prediction.predicted_class}
            </p>
            <p>
              <strong>Confidence:</strong> {(prediction.confidence * 100).toFixed(2)}%
            </p>
            
            {prediction.top_predictions && (
              <div>
                <strong>Top Predictions:</strong>
                <ul className="mt-2">
                  {prediction.top_predictions.slice(0, 3).map((pred: any, index: number) => (
                    <li key={index}>
                      {pred.class_name}: {(pred.confidence * 100).toFixed(1)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ImageUpload;
