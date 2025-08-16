"""
Sleep Analysis API - Mobile App Integration

Simple FastAPI endpoint that the mobile app can call to run the complete
sleep analysis pipeline and return results.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

# Import our pipeline integration
from sleep_pipeline_integration import SleepPipelineIntegration

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Sleep Analysis API",
    description="API for complete sleep analysis pipeline",
    version="1.0.0"
)

# Add CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipeline
pipeline = SleepPipelineIntegration()


class SleepAnalysisRequest(BaseModel):
    """Request model for sleep analysis"""
    hours_slept: float
    sleep_rating: int
    environmentQuality: int  # camelCase to match mobile app
    environmentComfort: int  # camelCase to match mobile app
    sleep_quality: Optional[str] = 'good'
    stress_level: Optional[str] = 'medium'
    exercise: Optional[str] = 'none'
    audio_file_path: Optional[str] = None

    class Config:
        # Allow extra fields and be more flexible with validation
        extra = "allow"
        validate_assignment = False


class SleepAnalysisResponse(BaseModel):
    """Response model for sleep analysis"""
    status: str
    final_score: float
    score_category: str
    confidence: float
    recommendations: list
    risk_factors: list
    processing_time: float
    output_file: str


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Sleep Analysis API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/analyze-sleep", response_model=SleepAnalysisResponse)
async def analyze_sleep(request: SleepAnalysisRequest):
    """
    Run complete sleep analysis pipeline
    
    This endpoint:
    1. Takes user inputs (hours, rating, quality, stress, exercise)
    2. Processes audio file if provided (or generates mock data)
    3. Runs RL-based apnea diagnosis (outputs 4 events as requested)
    4. Calculates comprehensive sleep quality score
    5. Returns results with recommendations and risk factors
    """
    try:
        logger.info(f"Received sleep analysis request for {request.hours_slept}h sleep")
        
        # Prepare user data - handle both camelCase and snake_case
        user_data = {
            'hours_slept': request.hours_slept,
            'sleep_rating': request.sleep_rating,
            'environment_quality': request.environmentQuality,
            'environment_comfort': request.environmentComfort,
            'sleep_quality': getattr(request, 'sleep_quality', 'good'),
            'stress_level': getattr(request, 'stress_level', 'medium'),
            'exercise': getattr(request, 'exercise', 'none')
        }
        
        # Run the complete pipeline
        result = pipeline.run_complete_pipeline(
            user_data, 
            request.audio_file_path
        )
        
        if result['status'] == 'completed':
            # Load the detailed results from the saved file
            import json
            with open(result['output_file'], 'r') as f:
                detailed_results = json.load(f)
            
            # Extract final sleep quality data
            final_quality = detailed_results['final_sleep_quality']
            
            return SleepAnalysisResponse(
                status="completed",
                final_score=final_quality['overall_score'],
                score_category=result['score_category'],
                confidence=final_quality['confidence'],
                recommendations=final_quality['recommendations'],
                risk_factors=final_quality['risk_factors'],
                processing_time=result['processing_time_seconds'],
                output_file=result['output_file']
            )
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Pipeline failed: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Error in sleep analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/pipeline-info")
async def get_pipeline_info():
    """Get information about the pipeline layers"""
    return {
        "pipeline_layers": [
            {
                "layer": 1,
                "name": "User Inputs + Audio Analysis",
                "description": "Processes user sleep data and MP3 audio files",
                "outputs": ["sleep efficiency", "deep/REM sleep", "latency", "wake-ups"]
            },
            {
                "layer": 2,
                "name": "RL Apnea Diagnosis",
                "description": "Detects sleep apnea events using RL models",
                "outputs": ["apnea events", "AHI", "oxygen levels", "breathing patterns"]
            },
            {
                "layer": 3,
                "name": "Sleep Quality Scoring",
                "description": "Combines all features for final assessment",
                "outputs": ["overall score", "recommendations", "risk factors"]
            }
        ],
        "features": {
            "user_inputs": ["hours slept", "sleep rating", "quality", "stress", "exercise"],
            "audio_analysis": ["sound levels", "sleep patterns", "efficiency metrics"],
            "apnea_detection": ["4 apnea events (as requested)", "risk assessment"],
            "final_scoring": ["0-100 score", "personalized recommendations"]
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    print("=== Sleep Analysis API ===")
    print("Starting API server...")
    print("Available endpoints:")
    print("  GET  / - Root endpoint")
    print("  GET  /health - Health check")
    print("  POST /analyze-sleep - Run complete pipeline")
    print("  GET  /pipeline-info - Pipeline information")
    print("\nTo test the API:")
    print("1. Start the server: python sleep_api.py")
    print("2. Send POST request to /analyze-sleep with user data")
    print("3. Get comprehensive sleep analysis results")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
