import io
import numpy as np
from PIL import Image
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Image Classification Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and labels
model = None
class_names = None

def load_model():
    """Load the pre-trained MobileNetV2 model"""
    global model, class_names
    
    try:
        # Load MobileNetV2 model pre-trained on ImageNet
        model = tf.keras.applications.MobileNetV2(
            weights='imagenet',
            include_top=True,
            input_shape=(224, 224, 3)
        )
        
        # Load ImageNet class names
        class_names = [
            'airplane', 'automobile', 'bird', 'cat', 'deer',
            'dog', 'frog', 'horse', 'ship', 'truck'
        ]
        
        logger.info("Model loaded successfully")
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise e

def preprocess_image(image: Image.Image) -> np.ndarray:
    """Preprocess image for MobileNetV2"""
    try:
        # Resize image to 224x224
        image = image.convert('RGB')
        image = image.resize((224, 224))
        
        # Convert to numpy array and normalize
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
        
        return img_array
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise HTTPException(status_code=400, detail="Error processing image")

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Image Classification Service is running", "status": "healthy"}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    """Predict image class"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        # Get ImageNet class name
        predicted_class = tf.keras.applications.mobilenet_v2.decode_predictions(
            predictions, top=1
        )[0][0]
        
        result = {
            "predicted_class": predicted_class[1],  # Class name
            "confidence": confidence,
            "class_index": int(predicted_class_index),
            "top_predictions": []
        }
        
        # Get top 5 predictions
        top_predictions = tf.keras.applications.mobilenet_v2.decode_predictions(
            predictions, top=5
        )[0]
        
        for pred in top_predictions:
            result["top_predictions"].append({
                "class_name": pred[1],
                "confidence": float(pred[2])
            })
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Error processing image")

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "service": "Image Classification API"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
