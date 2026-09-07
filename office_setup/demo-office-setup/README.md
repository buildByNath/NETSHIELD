# Office Setup - Munder Difflin UI Clone

A pixel-perfect recreation of the Munder Difflin office management interface with PixiJS rendering, pathfinding-based character movement, and full retro styling.

## Features

### 🎨 Visual Style
- Authentic retro pixel-art aesthetic matching Munder Difflin
- Cream/ink color palette with pixel-perfect rendering
- Press Start 2P display font for headings
- Hard drop shadows and pixel borders
- CRT-style monitor screens

### 🏢 Office Scene
- **40x30 tile-based office floor** with:
  - 10 worker desks with monitors
  - CEO office (Michael's desk)
  - Meeting room area
  - Cafeteria corner
  - Decorative plants and windows
  - Brick walls and tile flooring

### 👥 Character Features
- **15 procedural pixel-art characters** from The Office
- **4-direction walking animations** (up, down, left, right)
- **Smooth pathfinding** - click anywhere to walk there
- **Status indicators**:
  - 💛 Yellow dot = Working
  - 💙 Blue dot = Thinking
  - 💚 Green dot = Success
  - ❤️ Red dot = Blocked
  - ⚪ Gray dot = Idle

### 🎮 Controls
- **Click on floor** → Character walks there
- **Arrow keys** → Move selected character
- **Drag mouse** → Pan camera
- **Scroll wheel** → Zoom in/out
- **Click character** → Select agent
- **Double-click character** → Focus camera on agent

### 📊 UI Panels (Matching Original)
- **Left sidebar**: Agent list with pixel portraits
- **Right panel**: Agent control panel
- **Bottom strip**: Status indicators for all agents
- **Modals**: Add agent, settings, etc.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── PixelPanel.tsx          # Retro-styled panel
│   ├── PixelButton.tsx         # Pixel-art button
│   ├── AgentCard.tsx           # Sidebar agent card
│   ├── ControlPanel.tsx        # Right control panel
│   ├── AgentStrip.tsx          # Bottom status bar
│   └── OfficeFloor.tsx         # Main PixiJS scene
├── scene/
│   ├── Character.ts            # Character sprite + animation
│   ├── Camera.ts               # Camera system with zoom
│   ├── ThoughtBubble.ts        # Speech/thought bubbles
│   ├── officeMap.ts            # Map data
│   ├── pathfinding.ts          # A* pathfinding
│   └── portraitArt.ts          # Character rendering
├── design/
│   └── tokens.css              # Munder Difflin design tokens
└── store/
    └── store.ts                # Zustand state management
```

## Architecture

### PixiJS Scene (`OfficeFloor.tsx`)
- Renders the entire office with tile-based graphics
- Handles character sprites and animations
- Manages camera system with zoom/pan
- Processes click events for movement

### Pathfinding (`pathfinding.ts`)
- A* algorithm for optimal pathfinding
- Respects obstacles (desks, walls, furniture)
- Generates smooth walking paths
- Handles edge cases (unreachable destinations)

### Character System (`Character.ts`)
- Sprite rendering with 18x32 pixel sprites
- 4-direction walking animations (3 frames each)
- Sitting/standing animations
- Status indicator rendering
- Thought bubble display

### Camera System (`Camera.ts`)
- Smooth pan and zoom
- Focus on specific character
- Boundary detection (doesn't pan beyond map)
- Mouse wheel zoom (1x to 3x)

### State Management (`store.ts`)
- Zustand store for all agent data
- Real-time updates
- Select/deselect agents
- Update positions, status, etc.

## Default Agents

The office starts with 10 pre-configured agents:

1. **Michael** (CEO) - Status: Working
2. **Jim** (Sales) - Status: Working
3. **Pam** (Reception) - Status: Success
4. **Dwight** (Assistant RM) - Status: Working
5. **Angela** (Accounting) - Status: Thinking
6. **Kevin** (Accounting) - Status: Idle
7. **Oscar** (Accounting) - Status: Working
8. **Stanley** (Sales) - Status: Idle
9. **Phyllis** (Sales) - Status: Success
10. **Andy** (Sales) - Status: Thinking

## Controls Guide

### Keyboard
- **Arrow keys**: Move selected character
- **Escape**: Deselect current character
- **+/-**: Zoom in/out

### Mouse
- **Click floor**: Move selected character there
- **Click character**: Select agent
- **Double-click**: Focus camera on character
- **Drag**: Pan camera
- **Scroll**: Zoom

## Tech Stack

- React 18
- TypeScript
- Zustand (state management)
- PixiJS (rendering engine)
- Canvas API (character portraits)
- Vite (build tool)

## Customization

### Adding New Characters
Edit `portraitArt.ts` to add new character recipes with custom appearances.

### Changing Office Layout
Modify `officeMap.ts` to adjust desk positions, walls, and decorations.

### Visual Style
Adjust colors in `design/tokens.css` to change the retro palette.

## License

Extracted and adapted from Munder Difflin project. Character art is procedurally generated.
# demo-office-setup
