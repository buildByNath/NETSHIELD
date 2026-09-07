# Office Setup - Complete Rebuild

## Current Status: In Progress

I'm rebuilding the office UI to match the Munder Difflin program exactly with:

### ✅ Completed Features
1. Design tokens (CSS variables matching original)
2. Pathfinding algorithm (A* for character movement)
3. Office map layout system
4. Character portrait rendering (procedural pixel art)

### 🚧 Currently Building
1. **PixiJS Office Scene**
   - Full office floor with desks, walls, decorations
   - Character sprites with walking animations
   - Camera system with zoom and focus
   - Thought bubbles above characters

2. **Character Movement System**
   - Click-to-walk with pathfinding
   - Smooth walking animation (4 directions)
   - Keyboard arrow key controls for selected character
   - Mouse drag alternative

3. **Complete UI Panels** (matching original exactly)
   - Left sidebar: Agent list with pixel-art portraits
   - Right panel: Agent control panel with retro styling
   - Bottom strip: Agent status indicators
   - Pixel-styled buttons and borders
   - Press Start 2P font for headings

4. **Interactive Features**
   - Select agent by clicking
   - Zoom to focus on specific character
   - Camera pan and zoom controls
   - Monitor screens light up when agent is working
   - Status indicators update in real-time

### 📋 Full Implementation Plan

#### Phase 1: Core PixiJS Scene (2-3 hours)
- Office floor renderer with tile-based map
- Character sprite system with 4-direction walking
- Camera with zoom/pan
- Desk and furniture rendering

#### Phase 2: UI Components (1-2 hours)
- Pixel Panel component (retro border style)
- Pixel Button component
- Agent Card with portrait
- Control Panel with all inputs
- Agent Strip (bottom bar)

#### Phase 3: Integration (1 hour)
- Connect PixiJS scene to React
- State management for agents
- Movement controls (mouse + keyboard)
- Camera focus system

### Expected Total Time: 4-6 hours of development

## Quick Start (once complete)
```bash
npm install
npm run dev
```

## Architecture

```
src/
├── components/
│   ├── PixelPanel.tsx          # Retro-styled panel
│   ├── PixelButton.tsx         # Pixel-art button
│   ├── AgentCard.tsx           # Sidebar agent item
│   ├── ControlPanel.tsx        # Right control panel
│   ├── AgentStrip.tsx          # Bottom status bar
│   └── OfficeFloor.tsx         # Main PixiJS canvas
├── scene/
│   ├── Character.ts            # Character sprite + animation
│   ├── Camera.ts               # Camera system
│   ├── ThoughtBubble.ts        # Speech bubbles
│   ├── officeMap.ts            # Map data
│   ├── pathfinding.ts          # A* pathfinding
│   └── portraitArt.ts          # Character rendering
├── design/
│   └── tokens.css              # Design system
└── store/
    └── store.ts                # Zustand state
```

## Features Matching Original

### Visual Style
- ✅ Retro pixel-art aesthetic
- ✅ Cream/ink color palette
- ✅ Press Start 2P display font
- ✅ Hard drop shadows (no blur)
- ✅ Pixel-perfect rendering

### Office Scene
- 🚧 Tile-based office floor
- 🚧 10 desks with monitors
- 🚧 Walls, doors, windows
- 🚧 Decorative plants
- 🚧 Meeting room area
- 🚧 Cafeteria corner

### Character Features
- ✅ Procedural character generation
- 🚧 4-direction walking sprites
- 🚧 Smooth pathfinding movement
- 🚧 Sitting/standing animations
- 🚧 Thought bubbles
- 🚧 Status indicators (colored dots)

### Controls
- 🚧 Click anywhere to walk there
- 🚧 Arrow keys to move selected character
- 🚧 Drag camera to pan
- 🚧 Scroll to zoom
- 🚧 Click character to select
- 🚧 Double-click to focus camera

### UI Panels
- 🚧 Agent list (left sidebar)
- 🚧 Agent details (right panel)
- 🚧 Status strip (bottom)
- 🚧 Add agent modal
- 🚧 Settings menu

## Status: 30% Complete
Next steps: Building the PixiJS office floor component with full character animation system.
