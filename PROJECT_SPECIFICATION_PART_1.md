# NETSHIELD

## Network Attack Simulation & Response Planner

> **ROLE**
>
> You are an expert Software Architect, Senior React Developer, Senior
> Python/FastAPI Developer, UI/UX Designer, QA Engineer and Technical
> Writer.
>
> Build a COMPLETE, PRODUCTION-QUALITY project named **NETSHIELD --
> Network Attack Simulation & Response Planner**.
>
> This is a KTU Design and Analysis of Algorithms (DAA) educational
> project. The primary goal is to demonstrate graph and optimization
> algorithms through an interactive cyber-network simulation.
>
> **CRITICAL RULES**
>
> -   Never generate placeholder code.
> -   Never leave TODOs for agreed features.
> -   Every visible button must work.
> -   Every API endpoint must work.
> -   Every algorithm must be fully implemented in Python.
> -   The frontend must never use fake results after initial template
>     loading.
> -   Every animation must be driven by actual algorithm output.
> -   Prefer clean, beginner-friendly code.
> -   Add comments at the top of every file explaining its purpose.
> -   Stop after each milestone until it is fully working, tested,
>     committed to Git, and ready for the next milestone.

------------------------------------------------------------------------

# PROJECT NAME

NETSHIELD

Network Attack Simulation & Response Planner

------------------------------------------------------------------------

# TECH STACK

Frontend: - React (Vite) - React Flow - Tailwind CSS - Framer Motion -
Axios - Lucide React

Backend: - Python - FastAPI - NetworkX - Pydantic - Uvicorn

Project Type: - Desktop-first Web Application - Optimized for laptop
browsers only

------------------------------------------------------------------------

# PACKAGE INSTALLATION

Automatically: - Create Python virtual environment - Install all
required pip packages - Install all npm packages - Create
requirements.txt - Create package.json - Create .env.example - Verify
Node, Python and dependencies before running.

------------------------------------------------------------------------

# FOLDER STRUCTURE

Use a clean beginner-friendly structure.

frontend/src/ - components/ - pages/ - hooks/ - services/ -
algorithms/ - styles/ - assets/ - utils/ - App.jsx - main.jsx

backend/ - api/ - algorithms/ - models/ - schemas/ - services/ - main.py

Each algorithm in a separate Python file: - bfs.py - dfs.py -
dijkstra.py - prim.py - kruskal.py - floyd.py - union_find.py -
merge_sort.py - randomized_quicksort.py - matrix_chain.py -
strassen.py - knapsack.py - tsp.py - branch_bound.py - nqueen.py -
connected_components.py - topological_sort.py

------------------------------------------------------------------------

# DEFAULT TEMPLATE

Load automatically on startup.

Topology:

Internet \| Firewall \| Router \|--- Core Switch A \| \|--- Admin Switch
(5-8 PCs) \| \|--- CSE Switch (5-8 PCs) \| \|--- Core Switch B \|--- ECE
Switch (5-8 PCs) \|--- Library Switch (5-8 PCs) \|--- Server Switch
\|--- Application Server \|--- Database Server \|--- Backup Server

Support 100--150 nodes.

Allow: - Load Template - Empty Canvas - Save JSON - Load JSON - Auto
Save

------------------------------------------------------------------------

# NETWORK BUILDER

CircuitVerse-like interaction.

Support: - Drag & Drop - Zoom - Pan - Minimap - Grid - Undo/Redo -
Duplicate - Rename - Delete - Multi-select - Right-click context menu -
Edge editing - Editable weights - Default weights - Validation of
invalid links

------------------------------------------------------------------------

# VIRUS TYPES

Only:

1.  Worm (BFS)
2.  Network Scanner (DFS)
3.  Multi-point Attack (BFS from multiple sources)

Ask user to choose virus after clicking Start Attack.

Allow multiple node selection using: - Ctrl+Click - UI multi-select

------------------------------------------------------------------------

# RECOVERY

Implement:

-   Dijkstra
-   Prim
-   Kruskal
-   Floyd Warshall
-   Union Find
-   Connected Components
-   Topological Sort
-   Fractional Knapsack
-   Branch & Bound
-   TSP

------------------------------------------------------------------------

# LEARNING MODE

Optional toggle.

Show: - Queue - Stack - Priority Queue - Current node - Distances -
Selected edge - Union Find state - Time complexity - Space complexity

Include: Play Pause Next Previous Reset Speed slider

------------------------------------------------------------------------

# COMPARISON PAGE

Separate page.

Compare: - BFS vs DFS - Prim vs Kruskal

Show: Execution Time Memory Usage Visited Nodes Complexity Charts

------------------------------------------------------------------------

# DASHBOARD

Display: - Total Nodes - Total Edges - Healthy - Infected - Recovered -
Current Algorithm - Current Virus - Runtime

------------------------------------------------------------------------

# UI

Dark Theme

Colors:

Background #0F1720 Panels #233D4C Accent #FD802E Healthy #22C55E Virus
#EF4444 Recovery #3B82F6 Wire #4B5563

Animations: - Virus red pulse - Recovery blue pulse - Smooth
transitions - Animated counters

------------------------------------------------------------------------

# ERROR HANDLING

Replace browser errors with friendly messages.

Log technical details to console.

------------------------------------------------------------------------

# API

React -\> Axios -\> FastAPI -\> Python Algorithms -\> Results -\>
Animation

No mocked algorithm outputs.

------------------------------------------------------------------------

# GIT WORKFLOW

After every milestone:

-   Test
-   Fix bugs
-   git add .
-   git commit -m "Milestone X completed"
-   git push

------------------------------------------------------------------------

# README

Generate professional README including: - Installation - Screenshots
placeholders - Folder structure - APIs - Algorithms - Running
instructions - Git workflow - Future scope

------------------------------------------------------------------------

# DEVELOPMENT PHASES

Phase 1 - Project setup

Phase 2 - Network Builder

Phase 3 - Attack Simulation

Phase 4 - Recovery Algorithms

Phase 5 - Learning Mode

Phase 6 - Comparison Dashboard

Phase 7 - Performance Dashboard

Phase 8 - UI polish - Testing - Documentation

Never move to the next phase until the current phase is fully
functional.

------------------------------------------------------------------------

# FINAL ACCEPTANCE

The project is complete ONLY IF:

-   Every page works.
-   Every button works.
-   Every API works.
-   Every algorithm is implemented.
-   No placeholders remain.
-   Code is documented.
-   Runs without errors.
-   Suitable for KTU DAA viva.



# PROJECT_SPECIFICATION_.md


# NETSHIELD

## Network Attack Simulation & Response Planner

> This document is the primary instruction for Antigravity AI. Treat
> every requirement as mandatory.

# ROLE

You are simultaneously:

-   Senior Software Architect
-   Senior React Developer
-   Senior Python/FastAPI Developer
-   UI/UX Designer
-   QA Engineer
-   DevOps Engineer
-   Technical Writer

Your goal is to build a production-quality educational application named
**NETSHIELD**.

# PRIMARY GOAL

Build a fully working web application that demonstrates KTU Design and
Analysis of Algorithms using an interactive network attack simulation.

Never generate placeholders. Never skip agreed features. Never replace
algorithms with fake data.

# DEVELOPMENT PRINCIPLES

1.  Think before coding.
2.  Design architecture first.
3.  Keep the project beginner friendly.
4.  Every component has one responsibility.
5.  Every API must be documented.
6.  Every algorithm lives in its own Python file.
7.  Every visible button must perform a real action.
8.  Use comments to explain complex logic.
9.  Prefer readability over clever code.
10. Stop after every milestone, test, fix bugs, commit to Git, then
    continue.

# TECHNOLOGY STACK

Frontend - React + Vite - React Flow - Tailwind CSS - Framer Motion -
Axios - Lucide React

Backend - Python - FastAPI - NetworkX - Pydantic - Uvicorn

Storage - JSON project files by default. - Keep architecture extensible
for MongoDB/MySQL later but do not require them.

# AUTOMATIC SETUP

Automatically: - Create project folders. - Create Python virtual
environment. - Install all npm dependencies. - Install all pip
dependencies. - Generate requirements.txt. - Generate package.json. -
Generate .env.example. - Verify Node.js and Python versions. - Ensure
frontend and backend start without errors.

# PROJECT STRUCTURE

frontend/ src/ assets/ components/ hooks/ pages/ services/ styles/
utils/ App.jsx main.jsx

backend/ algorithms/ api/ models/ schemas/ services/ main.py

# ALGORITHM FILES

One algorithm per file.

Examples: - bfs.py - dfs.py - dijkstra.py - prim.py - kruskal.py -
floyd.py - connected_components.py - union_find.py -
topological_sort.py - merge_sort.py - randomized_quicksort.py -
matrix_chain.py - strassen.py - knapsack.py - branch_bound.py - tsp.py -
nqueen.py

# DEFAULT TEMPLATE

Load automatically at startup.

Topology

Internet \| Firewall \| Router \|-- Core Switch A \| \|-- Admin Switch
\| \|-- CSE Switch \| \|-- Core Switch B \|-- ECE Switch \|-- Library
Switch \|-- Server Switch

Each department switch contains 5--8 PCs.

Server Switch contains: - Application Server - Database Server - Backup
Server

Support 100--150 nodes.

# NETWORK BUILDER

Implement all features:

-   Drag & Drop
-   Zoom
-   Pan
-   Minimap
-   Undo
-   Redo
-   Delete
-   Duplicate
-   Rename
-   Editable node properties
-   Editable edge weights
-   Save JSON
-   Load JSON
-   Auto Save

# ATTACK TYPES

Only:

-   Worm (BFS)
-   Network Scanner (DFS)
-   Multi-Point Attack (Multi-source BFS)

Prompt user to choose attack type.

# RECOVERY

Implement:

-   Dijkstra
-   Prim
-   Kruskal
-   Floyd-Warshall
-   Connected Components
-   Union Find
-   Topological Sort
-   Fractional Knapsack
-   Branch & Bound
-   TSP

# UI

Dark theme.

Primary Accent: #FD802E

Background: #0F1720

Professional NOC appearance.

# GIT RULES

After every milestone:

git add . git commit -m "Milestone X completed" git push

Never continue before tests pass.

# STRICT RULES

-   No TODO comments for core features.
-   No placeholder pages.
-   No fake algorithm outputs.
-   No disabled buttons.
-   Every API connected to frontend.
-   Every animation uses real algorithm data.
-   Handle errors gracefully.
-   Keep code understandable for a beginner.

---

# 2. PROJECT OVERVIEW

## 2.1 Introduction

NETSHIELD (Network Attack Simulation & Response Planner) is an educational web application developed for the Design and Analysis of Algorithms (DAA) course under the KTU B.Tech Computer Science curriculum.

The application is **not** an antivirus, penetration testing tool, or cybersecurity attack framework. It is an interactive visualization and decision-support platform that demonstrates how graph algorithms can model attack propagation and recovery planning within computer networks.

The project enables students to understand DAA concepts by applying them to a realistic network environment rather than traditional console-based examples.

The primary goal is to make algorithms intuitive through visualization, animation, simulation, and interactive exploration.

---

# 2.2 Project Vision

Build a professional educational application that combines:

- Interactive Network Design
- Graph Algorithms
- Data Structures
- Animation
- Visualization
- Performance Analysis
- Learning Mode

The final application should resemble a modern enterprise network operations dashboard while remaining simple enough for undergraduate students to understand and extend.

---

# 2.3 Project Objectives

The system shall:

- Demonstrate BFS using worm propagation.
- Demonstrate DFS using network scanning.
- Demonstrate Multi-Source BFS using coordinated attacks.
- Demonstrate Dijkstra for shortest recovery path.
- Demonstrate Prim and Kruskal for optimized recovery networks.
- Demonstrate Floyd-Warshall for all-pairs shortest paths.
- Demonstrate Union-Find for connected network detection.
- Demonstrate Connected Components.
- Demonstrate Topological Sort.
- Demonstrate Fractional Knapsack.
- Demonstrate Branch and Bound.
- Demonstrate Traveling Salesman Problem.
- Provide educational visualization for Merge Sort.
- Provide educational visualization for Randomized Quick Sort.
- Provide educational visualization for Matrix Chain Multiplication.
- Provide educational visualization for Strassen Matrix Multiplication.
- Provide educational visualization for N-Queens.

---

# 2.4 Project Scope

The project includes:

✔ Interactive network builder

✔ Network templates

✔ Attack simulator

✔ Recovery planner

✔ Algorithm explorer

✔ Learning mode

✔ Comparison dashboard

✔ Performance dashboard

✔ JSON save/load

✔ Auto-save

✔ Developer mode

✔ Timeline playback

✔ Animation engine

✔ API backend

✔ Git-ready architecture

✔ Responsive desktop interface

---

The project does NOT include:

- Real malware
- Real hacking tools
- Packet sniffing
- Remote exploitation
- Network intrusion
- Shell execution
- Vulnerability scanning
- Operating system modification

NETSHIELD is purely an educational simulator.

---

# 2.5 Target Users

Primary Users

- KTU Students
- Engineering Students
- Faculty
- Project Evaluators

Secondary Users

- Algorithm learners
- Network beginners
- Computer Science enthusiasts

---

# 2.6 User Goals

Students should be able to:

Create a network.

Connect devices.

Assign edge weights.

Select attack type.

Watch propagation.

Pause simulation.

Resume simulation.

Observe queue/stack evolution.

Understand algorithm decisions.

Compare algorithms.

Measure performance.

Generate reports.

Save projects.

Reload projects.

---

# 3. FUNCTIONAL REQUIREMENTS

## FR-1 Dashboard

The dashboard shall display:

- Total Nodes
- Total Edges
- Healthy Nodes
- Infected Nodes
- Recovered Nodes
- Current Algorithm
- Virus Type
- Recovery Status
- Execution Time
- Memory Usage

Dashboard updates shall occur automatically.

---

## FR-2 Network Builder

Users shall be able to:

Create nodes.

Delete nodes.

Rename nodes.

Duplicate nodes.

Drag nodes.

Select multiple nodes.

Connect nodes.

Disconnect nodes.

Edit edge weights.

Edit latency.

Edit bandwidth.

Zoom.

Pan.

Undo.

Redo.

Save.

Load.

Auto-save.

---

## FR-3 Templates

Templates include:

Small Office

College Campus (Default)

Hospital

Enterprise

Blank Canvas

Each template must generate a valid graph.

---

## FR-4 Attack Simulation

Supported attacks:

### Worm

Algorithm

BFS

Animation

Red pulse.

Traversal

Level-order.

---

### Network Scanner

Algorithm

DFS

Animation

Depth traversal.

---

### Multi-Point Attack

Algorithm

Multi-source BFS.

Allow user to choose multiple infected nodes.

---

# FR-5 Recovery

Recovery algorithms include:

- Dijkstra
- Prim
- Kruskal
- Floyd-Warshall
- Connected Components
- Union Find
- Topological Sort
- Fractional Knapsack
- Branch and Bound
- TSP

Recovery animation uses blue pulses.

Recovered nodes become blue.

---

# FR-6 Learning Mode

Learning mode shall display algorithm internals.

For BFS:

Queue

Current node

Visited nodes

Discovered nodes

Iteration count

Pseudo code

Explanation

For DFS:

Stack

Backtracking

Recursive tree

Visited nodes

Pseudo code

For Dijkstra:

Priority queue

Distance table

Relaxation

Visited set

Shortest path tree

For Prim:

Chosen edge

Minimum edge

Visited vertices

MST weight

For Kruskal:

Sorted edges

Union operation

Cycle detection

Current MST

For every supported algorithm, provide a similar educational breakdown.

---

# FR-7 Timeline Controls

Playback controls:

Play

Pause

Resume

Next Step

Previous Step

Reset

Speed:

0.25×

0.5×

1×

2×

5×

Animation state must remain synchronized with algorithm execution.

---

# FR-8 Comparison Dashboard

Users may compare:

BFS vs DFS

Prim vs Kruskal

Metrics include:

Execution Time

Visited Nodes

Memory Usage

Space Complexity

Time Complexity

Traversal Order

Graph Coverage

Visualization Speed

Display charts where appropriate.

---

# FR-9 Performance Dashboard

Display:

Execution Time

Memory Usage

Nodes Processed

Edges Traversed

Algorithm Complexity

FPS (optional)

Average Frame Time

---

# FR-10 Save & Load

Save format:

JSON

Stored information:

Nodes

Edges

Weights

Positions

Templates

Simulation State

Recovery State

Timeline

Settings

Autosave shall execute periodically and before application exit.

---

# FR-11 Reports

Generate reports containing:

Network Summary

Attack Summary

Recovery Summary

Algorithm Statistics

Performance Metrics

Project Metadata

Export formats may include PDF in future versions.

---

# FR-12 Developer Mode

Developer mode displays:

API Requests

API Responses

Queue

Stack

Priority Queue

Execution Log

Algorithm Variables

Node States

Edge States

Frame Number

Debug Information

Developer mode is intended for learning and debugging and should be toggleable from the settings panel.

---

# 4. NON-FUNCTIONAL REQUIREMENTS (NFR)

The quality of the application is equally as important as its functionality. The following non-functional requirements are mandatory.

---

## NFR-1 Performance

The application shall provide smooth interaction while maintaining responsive user experience.

### Requirements

- Initial application startup should complete within 5 seconds on recommended hardware.
- Dashboard updates should occur instantly after any graph modification.
- Dragging nodes should remain smooth without noticeable lag.
- Zooming and panning should remain fluid.
- Simulations should support graphs containing at least 150 nodes.
- Graph rendering should avoid unnecessary re-rendering.
- API response time should typically remain below 500 milliseconds.
- Long-running algorithms should execute asynchronously to avoid freezing the UI.

---

## NFR-2 Reliability

The application shall maintain a consistent internal state.

Requirements:

- Invalid graphs must never crash the application.
- Failed API requests should display meaningful error messages.
- Unsaved work should not be lost unexpectedly.
- Autosave should reduce accidental data loss.
- Application state should remain synchronized between frontend and backend.

---

## NFR-3 Maintainability

The project is intended to be beginner-friendly while following professional software engineering practices.

Requirements:

- Small reusable components.
- Clear folder hierarchy.
- Descriptive filenames.
- Descriptive variable names.
- One responsibility per component.
- One algorithm per Python file.
- One API purpose per endpoint.
- Avoid deeply nested logic.
- Prefer readability over clever code.

---

## NFR-4 Scalability

The architecture should support future expansion without major redesign.

Future upgrades may include:

- MongoDB
- MySQL
- PostgreSQL
- Authentication
- Multi-user collaboration
- Cloud deployment
- AI-assisted attack prediction
- Real-time collaboration
- Import from Packet Tracer
- Network device libraries

Current implementation should not depend on these features.

---

## NFR-5 Portability

The project shall run on:

- Windows
- Linux
- macOS

Backend:

Python 3.11+

Frontend:

Node.js LTS

Browser:

- Chrome
- Edge
- Firefox

---

## NFR-6 Security

Since NETSHIELD is an educational simulator:

The application shall NOT

- execute system commands
- modify network settings
- open sockets to attack targets
- perform penetration testing
- execute malware
- download exploits

All simulations must remain virtual.

---

## NFR-7 Usability

The interface shall be intuitive.

Requirements:

- Minimal learning curve.
- Professional appearance.
- Clear navigation.
- Consistent button placement.
- Tooltips for important controls.
- Keyboard shortcuts where appropriate.
- Undo support.

---

## NFR-8 Accessibility

The UI should support:

- High contrast colors
- Readable typography
- Consistent spacing
- Large click targets
- Color-independent indicators where practical

---

# 5. SOFTWARE ARCHITECTURE

NETSHIELD follows a modular client-server architecture.

```
+--------------------------------------------------+
|                 React Frontend                   |
|--------------------------------------------------|
| Dashboard                                        |
| Network Builder                                  |
| Learning Mode                                    |
| Comparison Dashboard                             |
| Reports                                          |
+-----------------------▲--------------------------+
                        |
                    Axios API
                        |
+-----------------------▼--------------------------+
|                 FastAPI Backend                  |
|--------------------------------------------------|
| API Controllers                                  |
| Validation                                       |
| Services                                         |
| Algorithm Engine                                 |
| JSON Storage                                     |
+-----------------------▲--------------------------+
                        |
                        |
+-----------------------▼--------------------------+
|               Algorithm Modules                  |
|--------------------------------------------------|
| BFS                                              |
| DFS                                              |
| Dijkstra                                         |
| Prim                                             |
| Kruskal                                          |
| Floyd                                            |
| TSP                                              |
| Knapsack                                         |
| Merge Sort                                       |
| etc...                                           |
+--------------------------------------------------+
```

---

# 6. FRONTEND ARCHITECTURE

Framework

React

Build Tool

Vite

Language

JavaScript (No TypeScript unless explicitly requested)

Styling

Tailwind CSS

Routing

React Router

Animation

Framer Motion

Graph Engine

React Flow

HTTP Client

Axios

Icons

Lucide React

---

## Frontend Responsibilities

The frontend is responsible for:

- Rendering UI
- Handling user interaction
- Displaying animations
- Managing temporary application state
- Calling backend APIs
- Showing algorithm visualization
- Displaying learning mode

The frontend must never implement graph algorithms directly.

All algorithm computation shall occur in the backend.

---

## React Folder Structure

```
src/

assets/

components/

layout/

common/

dashboard/

network/

learning/

comparison/

performance/

reports/

settings/

hooks/

pages/

services/

utils/

styles/

App.jsx

main.jsx
```

---

# 7. BACKEND ARCHITECTURE

Framework:

FastAPI

Language:

Python

Graph Library:

NetworkX

Validation:

Pydantic

Server:

Uvicorn

---

Backend responsibilities:

Receive graph

Validate graph

Run algorithm

Generate animation frames

Return results

Save project

Load project

Generate statistics

Handle errors

---

Folder Structure

```
backend/

algorithms/

api/

models/

schemas/

services/

storage/

utils/

main.py

requirements.txt
```

---

# 8. DATA FLOW

```
User Action

↓

React Component

↓

Axios

↓

FastAPI Endpoint

↓

Validation

↓

Algorithm Engine

↓

Animation Generator

↓

JSON Response

↓

React State Update

↓

Animation

↓

Dashboard Update
```

---

# 9. PROJECT DIRECTORY STRUCTURE

```
NETSHIELD/

frontend/

backend/

docs/

README.md

LICENSE

.gitignore

.env.example

package.json

requirements.txt
```

---

## Frontend

```
frontend/

src/

components/

pages/

hooks/

services/

utils/

assets/

styles/

public/

package.json
```

---

## Backend

```
backend/

algorithms/

api/

schemas/

models/

services/

storage/

utils/

tests/

main.py
```

---

# 10. API DESIGN PRINCIPLES

Every API must satisfy the following:

✔ RESTful

✔ Stateless

✔ JSON only

✔ Proper HTTP status codes

✔ Input validation

✔ Meaningful error messages

✔ Consistent naming

---

Naming Example

Good

```
POST /simulate/bfs

POST /simulate/dfs

POST /recover/dijkstra

POST /save

GET /templates

GET /algorithms
```

Bad

```
POST /run

POST /go

POST /start

POST /algo
```

---

Every endpoint must include:

Purpose

Expected request

Expected response

Possible errors

Validation rules

---

# 11. JSON DATA MODEL

Every project shall be stored as JSON.

Root Structure

```json
{
  "project": {},
  "network": {},
  "simulation": {},
  "recovery": {},
  "settings": {},
  "metadata": {}
}
```

---

Metadata

```json
{
  "projectName": "",
  "author": "",
  "createdDate": "",
  "lastModified": "",
  "version": "1.0"
}
```

---

Node Object

```json
{
  "id": "",
  "label": "",
  "type": "",
  "status": "healthy",
  "position": {
      "x":0,
      "y":0
  }
}
```

---

Edge Object

```json
{
    "source":"",
    "target":"",
    "weight":1,
    "latency":10,
    "bandwidth":100
}
```

---

Simulation Object

```json
{
    "virus":"worm",
    "algorithm":"bfs",
    "speed":1,
    "timeline":[]
}
```

---

Recovery Object

```json
{
    "algorithm":"dijkstra",
    "timeline":[]
}
```

---

The backend must validate every JSON object before processing.

Malformed project files should return a meaningful validation error rather than causing an application crash.
---

# 12. USER INTERFACE (UI) & USER EXPERIENCE (UX) SPECIFICATION

## 12.1 Design Philosophy

NETSHIELD should feel like a professional Network Operations Center (NOC), not a hacking simulator.

The interface must prioritize:

- Simplicity
- Clarity
- Smooth animations
- High readability
- Modern UI
- Consistent spacing
- Responsive layout (Desktop First)

The UI should never overwhelm beginners.

---

# 12.2 Design Principles

The UI must follow these principles.

### Professional

Avoid flashy hacker effects.

Avoid green terminal themes.

Avoid excessive glowing effects.

---

### Consistent

Buttons must have identical styles.

Spacing must remain consistent.

Icons should belong to one icon family.

Typography should be uniform.

---

### Responsive

The application should adapt to

- 1366x768
- 1600x900
- 1920x1080
- 2560x1440

Primary optimization target:

1920x1080

---

### Smooth

Every animation should feel fluid.

Avoid sudden jumps.

Prefer easing animations.

Animation duration:

150–300ms for UI

500–1200ms for simulation

---

# 13. COLOR SYSTEM

## Background

Main

```
#0F1720
```

Panels

```
#233D4C
```

Cards

```
#1B2838
```

---

## Accent

Orange

```
#FD802E
```

Hover

```
#FF9C4A
```

---

## Healthy

```
#22C55E
```

---

## Virus

```
#EF4444
```

---

## Recovery

```
#3B82F6
```

---

## Warning

```
#FACC15
```

---

## Text

Primary

```
#F8FAFC
```

Secondary

```
#CBD5E1
```

Muted

```
#94A3B8
```

---

## Wire Color

```
#4B5563
```

---

# 14. TYPOGRAPHY

Font

Inter

Fallback

Roboto

System UI

---

Heading

Bold

Large

---

Subheading

Semi Bold

---

Body

Regular

---

Caption

Small

Muted

---

# 15. ICON SYSTEM

Use Lucide React icons.

Examples

Dashboard

Network

Shield

Bug

Server

Router

Database

Settings

Book

Play

Pause

Refresh

Save

Folder

Upload

Download

Git Branch

Clock

Chart

Activity

Memory Stick

---

Avoid mixing icon libraries.

---

# 16. APPLICATION LAYOUT

```
+------------------------------------------------------------+

 Sidebar      |               Header                         |

--------------+----------------------------------------------+

              |                                              |

              |                                              |

              |                                              |

              |          Main Content Area                   |

              |                                              |

              |                                              |

--------------+----------------------------------------------+

              Status Bar

+------------------------------------------------------------+
```

---

# 17. SIDEBAR

Permanent.

Collapsible.

Contains icons and labels.

Items

🏠 Dashboard

🖧 Network Builder

🐛 Attack Simulation

🛡 Recovery Planner

📘 Learning Mode

📊 Comparison

📈 Performance

📄 Reports

⚙ Settings

🧪 Developer Mode

---

Each item opens one page.

No nested routing unless necessary.

---

# 18. HEADER

Contains

Project Name

Current Template

Current Algorithm

Current Virus

Save Button

Load Button

Git Status (Optional)

Settings Shortcut

Dark Theme Toggle

---

# 19. DASHBOARD

Purpose

Provide overall network status.

Cards

Total Nodes

Total Edges

Healthy Nodes

Infected Nodes

Recovered Nodes

Current Algorithm

Simulation Speed

Execution Time

Memory Usage

---

Charts

Pie Chart

Healthy

Infected

Recovered

---

Bar Chart

Execution Time

---

Timeline Summary

Latest Events

---

# 20. NETWORK BUILDER

This is the heart of the application.

Purpose

Create editable network topology.

Powered by

React Flow

---

Features

Drag Nodes

Connect Nodes

Delete Nodes

Duplicate Nodes

Rename Nodes

Change Icons

Move Nodes

Undo

Redo

Zoom

Pan

MiniMap

Selection Box

Multiple Selection

Auto Layout

Snap to Grid

Export JSON

Import JSON

---

# 21. DEVICE LIBRARY

Supported Devices

Internet

Firewall

Router

Core Switch

Access Switch

PC

Laptop

Printer

Application Server

Database Server

Backup Server

Wireless Access Point

Cloud

---

Every device has

Icon

Label

Status

Properties

Position

Unique ID

---

# 22. CONNECTIONS

Connections support

Weight

Latency

Bandwidth

Direction (optional)

Connection Status

---

Default Weight

1

Default Latency

10ms

Default Bandwidth

100Mbps

---

# 23. RIGHT CLICK MENU

Node

Connect

Disconnect

Rename

Duplicate

Delete

Set Healthy

Set Infected

Set Protected

Properties

---

Edge

Delete

Change Weight

Change Latency

Change Bandwidth

---

Canvas

Paste

Add Device

Center View

Reset Zoom

---

# 24. PROPERTIES PANEL

Shows

Node ID

Node Name

Type

Status

Connections

Bandwidth

Latency

Notes

---

Editable

Name

Status

Weight

Bandwidth

Latency

---

# 25. NETWORK TEMPLATES

Default

College Campus

Other Templates

Small Office

Enterprise

Hospital

Blank

---

College Template

Internet

↓

Firewall

↓

Router

↓

Core Switch A

├── Admin Switch

├── CSE Switch

↓

Core Switch B

├── ECE Switch

├── Library Switch

├── Server Switch

↓

Application Server

Database Server

Backup Server

Each department contains

5–8 PCs.

---

# 26. ATTACK SIMULATION PAGE

Purpose

Visualize attack propagation.

Controls

Choose Virus

Select Start Node

Start

Pause

Resume

Reset

Speed Slider

Timeline

Statistics

---

Supported Virus Types

Worm

Network Scanner

Multi-Point Attack

---

Animation

Red pulse travels through edges.

Visited nodes become infected.

Traversal order displayed.

Current node highlighted.

---

Statistics

Visited Nodes

Remaining Nodes

Elapsed Time

Algorithm Complexity

Current Queue

Current Stack

---

# 27. RECOVERY PAGE

Purpose

Recover infected network.

Controls

Choose Algorithm

Run Recovery

Pause

Resume

Reset

Compare

---

Recovery Animation

Blue pulse

Recovered node becomes blue

Edges animate in recovery order

---

Display

Recovered Nodes

Remaining Infected

Execution Time

Recovery Path

Current Step

Algorithm Explanation

---

# 28. LEARNING MODE

Educational mode.

Every algorithm must display

Pseudo Code

Explanation

Variables

Current Step

Visualization

Data Structure

Complexity

Advantages

Disadvantages

Real-world Applications

---

This page should allow students to understand WHY the algorithm behaves as it does, not just observe the result.

---

# 29. ATTACK SIMULATION ENGINE

## 29.1 Purpose

The Attack Simulation Engine is responsible for simulating how a cyber attack spreads across a computer network using graph traversal algorithms.

This module is purely educational.

It must never perform any real attack, vulnerability scan, malware execution, penetration testing, or communication with external systems.

The simulation only visualizes algorithm execution on a graph.

---

# 29.2 Supported Attack Types

Only the following attacks shall exist.

| Attack | Algorithm |
|---------|-----------|
| Worm | BFS |
| Network Scanner | DFS |
| Multi-Point Attack | Multi-Source BFS |

No additional attack types should be added unless explicitly requested.

---

# 29.3 Simulation Workflow

User presses:

Start Simulation

↓

Choose Attack

↓

Select Starting Node(s)

↓

Validate Graph

↓

Send Graph to Backend

↓

Run Algorithm

↓

Generate Timeline Frames

↓

Return Timeline

↓

Play Animation

↓

Update Dashboard

↓

Display Statistics

---

# 29.4 Backend Responsibilities

The backend must

Validate graph

Validate starting node

Run algorithm

Record every step

Generate timeline

Generate statistics

Return JSON response

The backend performs ALL algorithm logic.

The frontend must never calculate BFS or DFS.

---

# 29.5 Frontend Responsibilities

Frontend responsibilities

Display animations

Show statistics

Render node colors

Render edge animations

Display learning mode

Pause

Resume

Step Forward

Step Backward

Speed Control

Timeline

---

# 29.6 Timeline Engine

Every algorithm execution must produce a timeline.

Example

Frame 1

Start Node

Frame 2

Visit Node A

Frame 3

Queue Updated

Frame 4

Visit Node B

Frame 5

Edge Animation

Frame 6

Dashboard Update

Every frame must contain enough information to replay the simulation.

---

# 29.7 Timeline Frame Model

Each frame shall contain

```json
{
  "frame":1,
  "currentNode":"PC-1",
  "visited":[
      "PC-1"
  ],
  "queue":[
      "SW-1"
  ],
  "stack":[],
  "currentEdge":[
      "PC-1",
      "SW-1"
  ],
  "action":"Visit Node"
}
```

Every frame should be independent.

---

# 29.8 Animation Rules

Nodes

Healthy

Green

↓

Visited

Orange Pulse

↓

Infected

Red

Edges

Gray

↓

Animated Red Pulse

↓

Gray

Recovered

Blue Pulse

↓

Blue Node

---

# 29.9 Playback Controls

Required controls

Play

Pause

Resume

Reset

Next

Previous

Speed Slider

Replay

---

# 29.10 Speed Levels

Supported

0.25×

0.5×

1×

2×

5×

Changing speed should not affect algorithm correctness.

Only animation timing changes.

---

# 29.11 Statistics

Display

Visited Nodes

Remaining Nodes

Current Node

Algorithm

Elapsed Time

Frame Number

Traversal Order

Queue Size

Stack Size

---

# 29.12 Error Handling

Examples

No graph created

No starting node selected

Disconnected graph

Invalid edge

Backend unavailable

Malformed response

Each error should display a user-friendly message.

Never expose raw Python exceptions.

---

# 30. BFS SIMULATION

## Purpose

Simulate worm propagation.

---

## Algorithm

Breadth First Search

---

## Traversal

Level by level.

---

## Data Structure

Queue

---

## Learning Panel

Display

Current Queue

Visited

Current Node

Iteration

Pseudo Code

Complexity

---

## Animation

Current node glows orange.

Outgoing edge pulses red.

Target node becomes infected.

Queue updates.

Repeat.

---

## Statistics

Queue Size

Visited Count

Traversal Order

Time Complexity

Space Complexity

---

## Time Complexity

O(V + E)

---

## Space Complexity

O(V)

---

# 31. DFS SIMULATION

Purpose

Simulate network scanner.

---

Traversal

Depth First

---

Data Structure

Stack

---

Learning Panel

Current Stack

Visited

Recursive Depth

Backtracking

Pseudo Code

---

Animation

Node flashes orange.

Moves deeper.

Backtracking animation.

Stack updates.

---

Statistics

Stack Size

Traversal Order

Visited Nodes

Execution Time

---

Time Complexity

O(V + E)

---

Space Complexity

O(V)

---

# 32. MULTI-SOURCE BFS

Purpose

Simulate coordinated attack.

---

User selects

Multiple infected nodes.

---

Traversal

All selected nodes enter queue simultaneously.

Propagation expands outward.

---

Learning Panel

Multiple Queue Sources

Current Frontier

Visited

Pseudo Code

---

Animation

Several red pulses begin simultaneously.

They spread independently.

Nodes already infected are ignored.

---

Statistics

Initial Sources

Propagation Layers

Visited Nodes

Execution Time

---

# 33. RECOVERY ENGINE

Purpose

Recover the network.

Unlike attack simulation, recovery algorithms calculate repair strategies instead of infection paths.

---

Workflow

Choose Algorithm

↓

Run Backend

↓

Generate Frames

↓

Animate Recovery

↓

Update Statistics

↓

Dashboard

---

Supported Algorithms

Dijkstra

Prim

Kruskal

Connected Components

Union Find

Floyd Warshall

Topological Sort

Fractional Knapsack

Branch and Bound

Traveling Salesman

---

Recovery animations always use BLUE.

Attack animations always use RED.

This distinction must remain consistent throughout the application.

---

# 34. ANIMATION ENGINE

Purpose

Provide reusable animations.

---

Animation Types

Node Highlight

Node Infection

Node Recovery

Edge Pulse

Queue Update

Stack Update

Priority Queue Update

Timeline Update

Dashboard Refresh

---

Animation Engine Rules

Animation logic should be reusable.

Algorithms should never directly manipulate UI.

Instead

Algorithm

↓

Frame Generator

↓

Animation Engine

↓

React Components

---

Benefits

Easy maintenance

Reusable animations

Consistent visuals

Simple debugging

Separation of concerns

---

# 35. FRAME GENERATOR

Every algorithm produces

Frames.

Frames drive

Learning Mode

Playback

Timeline

Statistics

Animation

Comparison Dashboard

Developer Mode

There should never be separate logic for these modules.

Everything must consume the same timeline.

This ensures every visualization remains synchronized with the algorithm execution.

---

# 36. ALGORITHM SPECIFICATION

## Purpose

This chapter defines every algorithm used in NETSHIELD.

Each algorithm must follow the same implementation philosophy.

Every algorithm must contain

- Independent Python implementation
- API Endpoint
- Timeline Generator
- Statistics Generator
- Learning Mode Support
- Developer Mode Support
- Error Handling
- Unit Tests

Algorithms should NEVER directly manipulate the UI.

Algorithms only return structured data.

---

# Standard Algorithm Interface

Every algorithm should implement the following interface.

Input

```python
graph
start_node
options
```

Output

```python
{
    "success": True,
    "timeline": [],
    "statistics": {},
    "learning": {},
    "result": {}
}
```

Every algorithm should return the same response structure.

This keeps the frontend independent of implementation details.

---

# 37. DIJKSTRA SHORTEST PATH

## Purpose

Find the minimum recovery path between two network devices.

---

## Used In

Recovery Planner

---

## Real World Meaning

Suppose a router fails.

The administrator wants to restore communication between

Firewall

↓

Database Server

using the least expensive path.

Dijkstra computes this path.

---

## Input

Graph

Weights

Source

Destination

---

## Output

Shortest Path

Total Cost

Timeline

Statistics

---

## Data Structure

Priority Queue

Distance Table

Visited Set

---

## Learning Mode

Display

Priority Queue

Distance Table

Visited Nodes

Current Node

Relaxation

Shortest Path Tree

---

## Animation

Current node glows blue.

Current edge pulses.

Distance updates animate.

Completed path glows blue.

---

## Statistics

Visited Nodes

Priority Queue Operations

Relaxations

Execution Time

Shortest Cost

---

Complexity

Time

O((V+E) logV)

Space

O(V)

---

# 38. PRIM'S ALGORITHM

Purpose

Generate a Minimum Spanning Tree.

---

Used In

Recovery Planner

---

Meaning

Reconnect every device using minimum total cable cost.

---

Input

Weighted Graph

---

Output

Minimum Spanning Tree

---

Learning Mode

Current Tree

Candidate Edges

Selected Edge

Total Weight

---

Animation

Chosen edge glows blue.

Rejected edges fade.

Tree expands gradually.

---

Statistics

Edges Selected

Edges Rejected

Total Weight

Execution Time

---

Complexity

Time

O(E logV)

Space

O(V)

---

# 39. KRUSKAL'S ALGORITHM

Purpose

Alternative MST generation.

---

Used In

Recovery Planner

---

Learning Mode

Sorted Edges

Union Operations

Cycle Detection

Chosen Edge

---

Animation

Edges sorted visually.

Accepted edges glow.

Rejected edges fade.

---

Statistics

Union Operations

Cycles Prevented

Tree Weight

Execution Time

---

Complexity

Time

O(E logE)

Space

O(V)

---

# 40. FLOYD-WARSHALL

Purpose

Calculate shortest path between every pair of nodes.

---

Used In

Recovery Planning

Network Analysis

---

Learning Mode

Distance Matrix

Intermediate Vertex

Matrix Updates

---

Animation

Matrix cells update.

Improved paths highlight.

---

Statistics

Matrix Updates

Shortest Paths Found

Execution Time

---

Complexity

Time

O(V³)

Space

O(V²)

---

# 41. CONNECTED COMPONENTS

Purpose

Identify isolated sections of the network.

---

Meaning

Shows disconnected subnetworks.

---

Learning Mode

Current Component

Visited

Remaining Components

---

Animation

Each component gets unique color.

---

Statistics

Number of Components

Largest Component

Smallest Component

---

Complexity

Time

O(V+E)

Space

O(V)

---

# 42. UNION FIND

Purpose

Maintain connected groups.

---

Used In

Kruskal

Network Validation

---

Learning Mode

Parent Array

Union

Find

Path Compression

---

Animation

Groups merge.

Parent pointers update.

---

Statistics

Find Operations

Union Operations

Compressed Paths

---

Complexity

Almost O(1)

Amortized

---

# 43. TOPOLOGICAL SORT

Purpose

Determine dependency order.

---

Meaning

Useful for

Service startup order

Recovery order

Task scheduling

---

Learning Mode

In Degree

Queue

Sorted List

---

Animation

Nodes removed gradually.

Order displayed.

---

Statistics

Processed Nodes

Remaining Nodes

---

Complexity

O(V+E)

---

# 44. FRACTIONAL KNAPSACK

Purpose

Prioritize recovery under limited resources.

---

Meaning

Suppose

Recovery Budget = 100

Servers cost different amounts.

Knapsack selects maximum value.

---

Learning Mode

Capacity

Current Weight

Current Value

Ratio

---

Animation

Items fill backpack.

Capacity updates.

---

Statistics

Capacity Used

Value Obtained

Efficiency

---

Complexity

O(n log n)

---

# 45. BRANCH AND BOUND

Purpose

Solve optimization problems efficiently.

---

Used In

Recovery Planning

Scheduling

---

Learning Mode

Search Tree

Current Bound

Best Solution

Pruned Branches

---

Animation

Tree expands.

Bad branches disappear.

Best path highlighted.

---

Statistics

Nodes Expanded

Nodes Pruned

Best Cost

Execution Time

---

# 46. TRAVELING SALESMAN

Purpose

Find optimal inspection route.

---

Meaning

Administrator must inspect every server.

Visit each once.

Return home.

---

Learning Mode

Current Route

Remaining Cities

Best Route

Best Cost

---

Animation

Route grows.

Improved route replaces previous.

---

Statistics

Routes Tested

Best Cost

Execution Time

---

# 47. MERGE SORT

Purpose

Educational visualization.

---

Learning Mode

Divide

Merge

Subarrays

Current Step

---

Animation

Array splits.

Subarrays merge.

---

Statistics

Comparisons

Merge Operations

Execution Time

---

Complexity

Time

O(n log n)

Space

O(n)

---

# 48. RANDOMIZED QUICK SORT

Purpose

Educational visualization.

---

Learning Mode

Pivot

Partitions

Recursive Calls

---

Animation

Pivot highlighted.

Swaps animate.

Subarrays separate.

---

Statistics

Swaps

Comparisons

Recursive Calls

---

Complexity

Average

O(n log n)

Worst

O(n²)

---

# 49. MATRIX CHAIN MULTIPLICATION

Purpose

Find optimal multiplication order.

---

Learning Mode

Cost Table

Parenthesization

Current Split

---

Animation

DP table fills gradually.

---

Statistics

Matrix Operations Saved

Execution Time

---

Complexity

O(n³)

---

# 50. STRASSEN MATRIX MULTIPLICATION

Purpose

Demonstrate divide-and-conquer optimization.

---

Learning Mode

Matrix Split

Recursive Calls

Seven Products

---

Animation

Matrices divide.

Recursive multiplication.

Combine.

---

Statistics

Recursive Calls

Matrix Multiplications

Execution Time

---

# 51. N-QUEENS

Purpose

Demonstrate backtracking.

---

Learning Mode

Current Row

Safe Positions

Backtracking

Solution Count

---

Animation

Queens placed.

Conflicts highlighted.

Backtracking shown.

---

Statistics

Backtracks

Solutions Found

Execution Time

---

# 52. COMMON REQUIREMENTS FOR ALL ALGORITHMS

Every algorithm MUST provide

✓ Timeline

✓ Statistics

✓ Learning Data

✓ Developer Data

✓ Animation Frames

✓ Error Handling

✓ Unit Tests

✓ API Endpoint

✓ Documentation

No algorithm may bypass these requirements.

---

# 53. ALGORITHM DIRECTORY STRUCTURE

```

backend/
algorithms/

bfs.py
dfs.py
dijkstra.py
prim.py
kruskal.py
floyd.py
union_find.py
connected_components.py
topological_sort.py
fractional_knapsack.py
branch_bound.py
tsp.py
merge_sort.py
randomized_quicksort.py
matrix_chain.py
strassen.py
nqueen.py

```

Each file should expose a single class or function with clear documentation and follow the common algorithm interface defined earlier.

---

# 54. BACKEND API SPECIFICATION

## Overview

The backend exposes a REST API built with FastAPI.

All communication between the frontend and backend shall occur through JSON.

The frontend must never directly execute algorithms.

Every algorithm must be executed through an API request.

---

## API Design Principles

Every endpoint must:

- Return JSON
- Validate input
- Return proper HTTP status codes
- Never expose Python stack traces
- Return consistent response format
- Include execution statistics

---

## Standard Response Format

Successful response

```json
{
    "success": true,
    "message": "",
    "data": {},
    "statistics": {},
    "timeline": []
}
```

---

Failure response

```json
{
    "success": false,
    "message": "Invalid starting node.",
    "error": {
        "code": "INVALID_NODE"
    }
}
```

---

# 55. API ENDPOINTS

## Health Check

GET

```
/health
```

Purpose

Verify backend availability.

Response

```json
{
    "status":"online"
}
```

---

## Available Algorithms

GET

```
/algorithms
```

Returns

```json
{
    "simulation":[
        "BFS",
        "DFS",
        "Multi BFS"
    ],

    "recovery":[
        "Dijkstra",
        "Prim",
        "Kruskal",
        "Floyd"
    ]
}
```

---

## Templates

GET

```
/templates
```

Returns all available templates.

---

## Load Template

POST

```
/template/load
```

Request

```json
{
    "template":"college"
}
```

---

## Simulate Attack

POST

```
/simulate
```

Request

```json
{
    "algorithm":"bfs",

    "graph":{},

    "startNode":"PC-1"
}
```

---

Returns

Timeline

Statistics

Traversal

Learning Data

---

## Recovery

POST

```
/recover
```

Request

```json
{
    "algorithm":"dijkstra",

    "graph":{}
}
```

---

## Save Project

POST

```
/save
```

---

## Load Project

POST

```
/load
```

---

## Export Report

POST

```
/report
```

---

# 56. FRONTEND SERVICES

Every API call should have a dedicated service.

Example

```
services/

algorithmService.js

projectService.js

templateService.js

reportService.js

dashboardService.js
```

Never call Axios directly from UI components.

---

# 57. STATE MANAGEMENT

React state should remain simple.

Use

useState

useEffect

useMemo

useCallback

only where beneficial.

Avoid unnecessary complexity.

Do NOT introduce Redux, Zustand, MobX, or Context API unless the project genuinely outgrows local state.

---

## Recommended State Layout

```
App

↓

Dashboard State

↓

Network State

↓

Simulation State

↓

Recovery State

↓

Settings State
```

Each page should manage its own local state whenever possible.

---

# 58. DEVELOPER MODE

Developer Mode is intended for debugging and educational purposes.

It must be optional and toggleable.

---

Developer Mode displays

Current API request

API response

Algorithm variables

Queue

Stack

Priority Queue

Distance Table

Union Find Parent Array

Execution Time

Frame Number

Node Count

Edge Count

Graph Validation

Logs

---

Developer Mode must NEVER modify algorithm behavior.

It is purely observational.

---

# 59. ERROR HANDLING

Every error should be meaningful.

Examples

Network not connected.

No node selected.

Backend unavailable.

Invalid JSON.

Duplicate node.

Duplicate edge.

Negative edge weight.

Disconnected graph.

No recovery path found.

Unknown algorithm.

Timeout.

---

Never display

Python traceback

Console exception

Stack trace

Unhandled promise rejection

Instead

Show friendly dialog.

Offer retry.

Allow user to continue.

---

# 60. LOGGING

Backend should log

Application start

Application shutdown

API calls

Errors

Warnings

Algorithm execution

Execution time

Project loading

Project saving

Logs should remain readable.

---

# 61. TESTING STRATEGY

Testing is mandatory.

Every milestone must be tested before proceeding.

---

## Unit Testing

Test

Algorithms

Validators

JSON parser

Utilities

---

## Integration Testing

Test

Frontend ↔ Backend communication

Simulation

Recovery

Save

Load

Timeline

Learning Mode

---

## UI Testing

Verify

Buttons

Dialogs

Animations

Sidebar

Navigation

Theme

Templates

Playback

Statistics

---

## Performance Testing

Measure

Execution Time

Memory Usage

Frame Rate

Large Graph Performance

Response Time

---

# 62. GIT WORKFLOW

After every milestone

```
git add .

git commit -m "Milestone X completed"

git push
```

Commit messages must be descriptive.

Examples

```
Implemented Network Builder

Completed BFS Simulation

Added Learning Mode

Implemented Dijkstra Recovery

Completed Timeline Engine
```

Never accumulate dozens of unrelated changes into one commit.

---

# 63. CODE QUALITY

Every file must include

Purpose

Author

Description

Comments for complex logic

Avoid magic numbers.

Prefer constants.

Avoid duplicate code.

Prefer reusable functions.

Meaningful variable names.

Meaningful function names.

---

Bad

```
x

a

temp

abc()
```

Good

```
currentNode

visitedNodes

calculateShortestPath()

generateTimelineFrame()
```

---

# 64. DOCUMENTATION

Every module must be documented.

Include

Purpose

Inputs

Outputs

Example

Complexity

Dependencies

---

README must include

Project Description

Features

Installation

Running Frontend

Running Backend

Folder Structure

Screenshots (future)

Algorithms Used

Future Scope

License

Acknowledgements

---

# 65. ACCEPTANCE CRITERIA

The project is considered complete only if all of the following are true.

✓ Frontend builds successfully.

✓ Backend starts without errors.

✓ All APIs function.

✓ Templates load correctly.

✓ Network Builder is fully functional.

✓ Attack Simulation works.

✓ Recovery algorithms work.

✓ Learning Mode explains every algorithm.

✓ Timeline playback works.

✓ Reports generate correctly.

✓ JSON save/load works.

✓ Error handling is implemented.

✓ Developer Mode works.

✓ UI is polished.

✓ Code is documented.

✓ Git history is clean.

✓ No placeholder code exists.

✓ No TODOs remain for core functionality.

✓ All mandatory algorithms are implemented.

✓ All buttons perform real actions.

---

# 66. FUTURE ENHANCEMENTS

The architecture should support future additions without requiring major redesign.

Possible enhancements include

- Authentication
- User profiles
- Multi-user collaboration
- MongoDB support
- MySQL support
- PostgreSQL support
- Docker deployment
- Cloud deployment
- AI-assisted recovery recommendations
- Additional graph algorithms
- Packet Tracer import
- Real-time network monitoring (simulation only)
- Plugin architecture
- Mobile companion app

These features are out of scope for version 1.0 but should be considered during architectural design.

---

# 67. FINAL INSTRUCTIONS FOR ANTIGRAVITY

You are not generating a prototype.

You are building a complete software project.

Before writing code:

1. Read this entire specification.
2. Understand the architecture.
3. Create a development plan.
4. Identify milestones.
5. Explain the implementation approach.
6. Begin with project setup.
7. Complete one milestone at a time.
8. Test every milestone.
9. Fix all issues before continuing.
10. Never skip requirements.

Rules:

- Never use placeholder implementations.
- Never fake algorithm outputs.
- Never leave core features incomplete.
- Never remove requested functionality for convenience.
- Keep the project beginner-friendly and well-commented.
- Maintain consistent coding style.
- Follow the folder structure exactly unless a justified improvement is documented.
- Ask for clarification only if a requirement is genuinely ambiguous.

The objective is to produce a maintainable, educational, production-quality application that faithfully implements the NETSHIELD specification.

---

# END OF PROJECT SPECIFICATION
