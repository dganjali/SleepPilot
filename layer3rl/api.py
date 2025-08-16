"""
FastAPI Server for Sleep Environment Optimization System

This module provides REST API endpoints for:
- User profile management
- RL agent training
- Recommendation generation
- System status and monitoring
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import json
import os
import uuid
from datetime import datetime
import asyncio

from user_generator import SyntheticUserGenerator, UserProfile
from rl_agent import SleepOptimizationAgent
from recommendation_engine import RecommendationEngine, create_recommendation_engine


# Initialize FastAPI app
app = FastAPI(
    title="Sleep Environment Optimization API",
    description="API for personalized sleep environment optimization using RL",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global storage (in production, use a proper database)
user_profiles = {}
trained_agents = {}
training_status = {}


# Pydantic models for API requests/responses
class UserProfileRequest(BaseModel):
    user_id: Optional[str] = None
    age: Optional[int] = Field(None, ge=18, le=100)
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")
    weight: Optional[float] = Field(None, gt=0)
    height: Optional[float] = Field(None, gt=0)
    temp_optimal: Optional[float] = Field(None, ge=10, le=30)
    light_sensitivity: Optional[float] = Field(None, ge=0, le=1)
    noise_tolerance: Optional[float] = Field(None, ge=0, le=1)
    humidity_preference: Optional[float] = Field(None, ge=0, le=1)
    airflow_preference: Optional[float] = Field(None, ge=0, le=1)
    baseline_sleep_score: Optional[float] = Field(None, ge=0, le=100)
    baseline_apnea_risk: Optional[float] = Field(None, ge=0, le=1)
    baseline_fragmentation: Optional[float] = Field(None, ge=0, le=50)


class UserProfileResponse(BaseModel):
    user_id: str
    age: Optional[int]
    gender: Optional[str]
    weight: Optional[float]
    height: Optional[float]
    temp_optimal: float
    light_sensitivity: float
    noise_tolerance: float
    humidity_preference: float
    airflow_preference: float
    baseline_sleep_score: Optional[float]
    baseline_apnea_risk: Optional[float]
    baseline_fragmentation: Optional[float]
    created_at: str


class TrainingRequest(BaseModel):
    user_id: str
    algorithm: str = Field("PPO", pattern="^(PPO|SAC|TD3)$")
    total_timesteps: int = Field(50000, ge=1000, le=1000000)


class TrainingStatus(BaseModel):
    user_id: str
    status: str  # "pending", "training", "completed", "failed"
    progress: float  # 0-100
    current_step: int
    total_steps: int
    start_time: str
    estimated_completion: Optional[str]
    error_message: Optional[str]


class RecommendationRequest(BaseModel):
    user_id: str
    current_environment: Optional[Dict[str, float]] = None
    include_lifestyle: bool = True


class RecommendationResponse(BaseModel):
    user_id: str
    timestamp: str
    current_sleep_score: float
    baseline_sleep_score: float
    environment_recommendations: Dict[str, Any]
    lifestyle_recommendations: Optional[Dict[str, Any]]
    sleep_quality_analysis: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    implementation_plan: Dict[str, Any]
    overall_confidence: float
    data_quality_score: float


class SystemStatus(BaseModel):
    status: str
    total_users: int
    trained_agents: int
    active_trainings: int
    uptime: str


# API Endpoints

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Sleep Environment Optimization API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=Dict[str, str])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/status", response_model=SystemStatus)
async def get_system_status():
    """Get overall system status."""
    active_trainings = sum(1 for status in training_status.values() 
                          if status["status"] in ["pending", "training"])
    
    return SystemStatus(
        status="running",
        total_users=len(user_profiles),
        trained_agents=len(trained_agents),
        active_trainings=active_trainings,
        uptime=datetime.now().isoformat()
    )


@app.post("/users", response_model=UserProfileResponse)
async def create_user_profile(request: UserProfileRequest):
    """Create a new user profile."""
    user_id = request.user_id or f"user_{uuid.uuid4().hex[:8]}"
    
    # Check if user already exists
    if user_id in user_profiles:
        raise HTTPException(status_code=400, detail=f"User {user_id} already exists")
    
    # Generate user profile
    generator = SyntheticUserGenerator()
    
    if request.age or request.gender or request.weight or request.height:
        # Create custom user profile
        user = UserProfile(
            user_id=user_id,
            temp_min=request.temp_optimal - 2 if request.temp_optimal else 18,
            temp_max=request.temp_optimal + 2 if request.temp_optimal else 22,
            temp_optimal=request.temp_optimal or 20,
            light_sensitivity=request.light_sensitivity or 0.5,
            noise_tolerance=request.noise_tolerance or 0.5,
            humidity_preference=request.humidity_preference or 0.5,
            airflow_preference=request.airflow_preference or 0.5,
            baseline_sleep_score=request.baseline_sleep_score,
            baseline_apnea_risk=request.baseline_apnea_risk,
            baseline_fragmentation=request.baseline_fragmentation,
            age=request.age,
            gender=request.gender,
            weight=request.weight,
            height=request.height
        )
    else:
        # Generate synthetic user profile
        user = generator.generate_user_profile(user_id)
    
    # Store user profile
    user_profiles[user_id] = user
    
    return UserProfileResponse(
        user_id=user.user_id,
        age=user.age,
        gender=user.gender,
        weight=user.weight,
        height=user.height,
        temp_optimal=user.temp_optimal,
        light_sensitivity=user.light_sensitivity,
        noise_tolerance=user.noise_tolerance,
        humidity_preference=user.humidity_preference,
        airflow_preference=user.airflow_preference,
        baseline_sleep_score=user.baseline_sleep_score,
        baseline_apnea_risk=user.baseline_apnea_risk,
        baseline_fragmentation=user.baseline_fragmentation,
        created_at=datetime.now().isoformat()
    )


@app.get("/users/{user_id}", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Get user profile by ID."""
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    user = user_profiles[user_id]
    
    return UserProfileResponse(
        user_id=user.user_id,
        age=user.age,
        gender=user.gender,
        weight=user.weight,
        height=user.height,
        temp_optimal=user.temp_optimal,
        light_sensitivity=user.light_sensitivity,
        noise_tolerance=user.noise_tolerance,
        humidity_preference=user.humidity_preference,
        airflow_preference=user.airflow_preference,
        baseline_sleep_score=user.baseline_sleep_score,
        baseline_apnea_risk=user.baseline_apnea_risk,
        baseline_fragmentation=user.baseline_fragmentation,
        created_at=datetime.now().isoformat()
    )


@app.get("/users", response_model=List[str])
async def list_users():
    """List all user IDs."""
    return list(user_profiles.keys())


@app.post("/train", response_model=Dict[str, str])
async def start_training(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Start training an RL agent for a user."""
    if request.user_id not in user_profiles:
        raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
    
    # Check if already training
    if request.user_id in training_status and training_status[request.user_id]["status"] in ["pending", "training"]:
        raise HTTPException(status_code=400, detail=f"Training already in progress for user {request.user_id}")
    
    # Initialize training status
    training_status[request.user_id] = {
        "status": "pending",
        "progress": 0.0,
        "current_step": 0,
        "total_steps": request.total_timesteps,
        "start_time": datetime.now().isoformat(),
        "estimated_completion": None,
        "error_message": None
    }
    
    # Start training in background
    background_tasks.add_task(train_agent_background, request.user_id, request.algorithm, request.total_timesteps)
    
    return {
        "message": f"Training started for user {request.user_id}",
        "user_id": request.user_id,
        "algorithm": request.algorithm,
        "total_timesteps": request.total_timesteps
    }


async def train_agent_background(user_id: str, algorithm: str, total_timesteps: int):
    """Background task for training RL agent."""
    try:
        # Update status to training
        training_status[user_id]["status"] = "training"
        
        # Get user profile
        user = user_profiles[user_id]
        
        # Create and train agent
        agent = SleepOptimizationAgent(user, algorithm=algorithm)
        
        # Custom callback to track progress
        class ProgressCallback:
            def __init__(self, user_id: str, total_steps: int):
                self.user_id = user_id
                self.total_steps = total_steps
                self.current_step = 0
            
            def __call__(self, locals, globals):
                self.current_step += locals.get('self').n_steps
                progress = min(100.0, (self.current_step / self.total_steps) * 100)
                
                training_status[self.user_id]["progress"] = progress
                training_status[self.user_id]["current_step"] = self.current_step
                
                # Estimate completion time
                if progress > 0:
                    elapsed = (datetime.now() - datetime.fromisoformat(training_status[self.user_id]["start_time"])).total_seconds()
                    estimated_total = elapsed / (progress / 100)
                    estimated_remaining = estimated_total - elapsed
                    estimated_completion = datetime.now().timestamp() + estimated_remaining
                    training_status[self.user_id]["estimated_completion"] = datetime.fromtimestamp(estimated_completion).isoformat()
        
        # Train agent
        agent.train(
            total_timesteps=total_timesteps,
            save_path=f"api_models/{user_id}",
            eval_freq=5000
        )
        
        # Store trained agent
        trained_agents[user_id] = {
            "agent": agent,
            "algorithm": algorithm,
            "trained_at": datetime.now().isoformat(),
            "total_timesteps": total_timesteps
        }
        
        # Update status to completed
        training_status[user_id]["status"] = "completed"
        training_status[user_id]["progress"] = 100.0
        training_status[user_id]["current_step"] = total_timesteps
        
    except Exception as e:
        # Update status to failed
        training_status[user_id]["status"] = "failed"
        training_status[user_id]["error_message"] = str(e)


@app.get("/train/status/{user_id}", response_model=TrainingStatus)
async def get_training_status(user_id: str):
    """Get training status for a user."""
    if user_id not in training_status:
        raise HTTPException(status_code=404, detail=f"No training found for user {user_id}")
    
    status = training_status[user_id]
    return TrainingStatus(**status)


@app.get("/train/status", response_model=Dict[str, TrainingStatus])
async def get_all_training_status():
    """Get training status for all users."""
    return {user_id: TrainingStatus(**status) for user_id, status in training_status.items()}


@app.post("/recommendations", response_model=RecommendationResponse)
async def generate_recommendations(request: RecommendationRequest):
    """Generate sleep optimization recommendations for a user."""
    if request.user_id not in user_profiles:
        raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
    
    if request.user_id not in trained_agents:
        raise HTTPException(status_code=400, detail=f"No trained agent found for user {request.user_id}. Please train an agent first.")
    
    try:
        # Create recommendation engine
        model_path = f"api_models/{request.user_id}"
        engine = create_recommendation_engine(model_path, trained_agents[request.user_id]["algorithm"])
        
        # Generate recommendations
        report = engine.generate_recommendations(
            current_environment=request.current_environment,
            include_lifestyle=request.include_lifestyle
        )
        
        # Convert to response format
        return RecommendationResponse(
            user_id=report.user_id,
            timestamp=report.timestamp,
            current_sleep_score=report.current_sleep_score,
            baseline_sleep_score=report.baseline_sleep_score,
            environment_recommendations=report.environment_recommendations.__dict__,
            lifestyle_recommendations=report.lifestyle_recommendations.__dict__ if report.lifestyle_recommendations else None,
            sleep_quality_analysis=report.sleep_quality_analysis,
            risk_assessment=report.risk_assessment,
            implementation_plan=report.implementation_plan,
            overall_confidence=report.overall_confidence,
            data_quality_score=report.data_quality_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_latest_recommendations(user_id: str):
    """Get the latest recommendations for a user."""
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    # This would typically fetch from a database in production
    # For now, generate fresh recommendations
    request = RecommendationRequest(user_id=user_id)
    return await generate_recommendations(request)


@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user and all associated data."""
    if user_id not in user_profiles:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")
    
    # Remove user data
    del user_profiles[user_id]
    
    if user_id in trained_agents:
        del trained_agents[user_id]
    
    if user_id in training_status:
        del training_status[user_id]
    
    # Remove model files
    model_path = f"api_models/{user_id}"
    if os.path.exists(model_path):
        import shutil
        shutil.rmtree(model_path)
    
    return {"message": f"User {user_id} deleted successfully"}


@app.get("/models", response_model=Dict[str, Dict[str, Any]])
async def list_trained_models():
    """List all trained models."""
    models = {}
    for user_id, agent_info in trained_agents.items():
        models[user_id] = {
            "algorithm": agent_info["algorithm"],
            "trained_at": agent_info["trained_at"],
            "total_timesteps": agent_info["total_timesteps"]
        }
    return models


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize API on startup."""
    # Create necessary directories
    os.makedirs("api_models", exist_ok=True)
    print("Sleep Environment Optimization API started")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    print("Sleep Environment Optimization API shutdown")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
