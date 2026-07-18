from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

"""
File: main.py
Author: Antigravity AI
Purpose: Entrypoint for the FastAPI backend, implementing configuration, CORS, and health routing.
"""

app = FastAPI(
    title="NETSHIELD API",
    description="Network Attack Simulation & Response Planner Backend API",
    version="1.0.0"
)

# Enable CORS for React frontend running locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """
    Check the status of the backend service.
    Returns:
        dict: containing 'status' as 'online'.
    """
    return {"status": "online"}
