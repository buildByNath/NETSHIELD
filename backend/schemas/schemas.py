from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

"""
File: schemas.py
Author: Antigravity AI
Purpose: Pydantic schemas defining the network models, graph model, project model, and validation results.
"""

class Position(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    id: str
    label: str
    type: str  # Internet, Firewall, Router, Core Switch, Access Switch, PC, Laptop, Printer, Application Server, etc.
    status: str = Field(default="healthy")  # healthy, infected, recovered, protected
    position: Position

class EdgeData(BaseModel):
    source: str
    target: str
    weight: float = Field(default=1.0, ge=0.0)
    latency: float = Field(default=10.0, ge=0.0)  # in ms
    bandwidth: float = Field(default=100.0, ge=0.0)  # in Mbps

class GraphData(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]

class Metadata(BaseModel):
    projectName: str = Field(default="Untitled Project")
    author: str = Field(default="KTU Student")
    createdDate: Optional[str] = None
    lastModified: Optional[str] = None
    version: str = Field(default="1.0")

class ProjectState(BaseModel):
    project: Optional[Dict[str, Any]] = Field(default_factory=dict)
    network: GraphData
    simulation: Optional[Dict[str, Any]] = Field(default_factory=dict)
    recovery: Optional[Dict[str, Any]] = Field(default_factory=dict)
    settings: Optional[Dict[str, Any]] = Field(default_factory=dict)
    metadata: Metadata

class ValidationResult(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str]

class SimulationRequest(BaseModel):
    algorithm: str
    graph: GraphData
    startNodes: List[str]

