import { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics, Ticker, Texture } from 'pixi.js';
import 'pixi.js/unsafe-eval';
import { useStore, type Agent, type AgentStatus } from '../../store/store';
import { TiledMapRenderer } from '../../scene/TiledMapRenderer';
import { Camera } from '../../scene/Camera';
import { Character, paintCup } from '../../scene/Character';
import { DeskScreen, type ScreenStatus } from '../../scene/DeskScreen';
import { useSimulation } from '../../context/SimulationContext';
import { MessageEnvelope } from '../../scene/MessageEnvelope';
import { hexToNumber, getCastFrames } from '../../scene/cast';
import { type BreakSpot } from '../../scene/cafeteriaLines';
import { colors } from '../../design/tokens';
import { loadTheme, resolveThemeMap, themeTilesetUrls } from '../../scene/themeLoader';
import { installContextLossRecovery } from '../../scene/glRecovery';
import type { Tile, Facing } from '../../scene/themeRegistry';

interface CafeChat {
  lines: readonly string[];
  partnerId: string;
  idx: number;
  beat: number;
}

interface CafeBreak {
  spotIdx: number;
  phase: 'walking' | 'lingering';
  timer: number;
  quipTimer: number;
  chat?: CafeChat;
  chattingWith?: string;
}

interface ErrandRun {
  phase: 'walking' | 'doing';
  timer: number;
  idx: number;
}

interface CoffeeRun {
  phase: 'toTray' | 'taking' | 'toMachine' | 'brewing' | 'toSink' | 'washing' | 'toTrayBack' | 'placing';
  timer: number;
}

interface Runtime {
  character: Character;
  seatIndex: number | null;
  waitTile: Tile;
  charName: string;
  prevStatus?: string;
  prevAction?: string;
  prevCarrying?: string;
  prevPrompt?: string;
  brk?: CafeBreak;
  screen?: DeskScreen;
  cupCarryHome?: boolean;
  err?: ErrandRun;
  run?: CoffeeRun;
  busySince?: number;
  isDragging?: boolean;
}

function loadTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const tex = Texture.from(img);
      tex.source.scaleMode = 'nearest';
      resolve(tex);
    };
    img.onerror = () => reject(new Error('failed to load ' + url.slice(0, 40)));
    img.src = url;
  });
}

function hexNum(c: string | number): number {
  if (typeof c === 'number') return c;
  return hexToNumber(c);
}

function safeDestroy(app: Application | null) {
  if (!app) return;
  try {
    app.destroy({ removeView: true });
  } catch (err) {
    console.warn('[OfficeFloor] app.destroy caught:', err);
  }
}

function liveActivity(agent: Agent, fallback = ''): string {
  const action = (agent.action || '').trim();
  if (action) return action;
  return firstWords(agent.lastPrompt) || fallback;
}

function firstWords(prompt: string | undefined, maxWords = 6, maxChars = 42): string {
  if (!prompt) return '';
  const words = prompt.trim().split(/\s+/);
  let out = words.slice(0, maxWords).join(' ');
  const truncatedWords = words.length > maxWords;
  if (out.length > maxChars) out = out.slice(0, maxChars).trimEnd();
  else if (truncatedWords) out += '…';
  return out;
}

export function OfficeFloor() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const mountIdRef = useRef(0);
  const [glGeneration, setGlGeneration] = useState(0);
  const officeTheme = useStore((s) => s.officeTheme);

  const { nodeSimStates } = useSimulation();
  const simStatesRef = useRef(nodeSimStates);
  useEffect(() => {
    simStatesRef.current = nodeSimStates;
  }, [nodeSimStates]);

  const [docHidden, setDocHidden] = useState(() => document.hidden);
  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const paused = docHidden;
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    const ticker = appRef.current?.ticker;
    if (!ticker) return;
    if (paused) ticker.stop(); else ticker.start();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    while (host.firstChild) host.removeChild(host.firstChild);

    const mountId = ++mountIdRef.current;
    const app = new Application();
    appRef.current = app;

    const runtimes = new Map<string, Runtime>();
    const seatClaims = new Set<number>();
    const envelopes: MessageEnvelope[] = [];

    const init = async () => {
      const theme = await loadTheme(officeTheme as any);
      await app.init({
        background: hexNum(theme.palette.background),
        antialias: false,
        roundPixels: true,
        resolution: Math.max(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        width: host.clientWidth || 800,
        height: host.clientHeight || 600,
      });

      if (mountIdRef.current !== mountId) { safeDestroy(app); return; }
      while (host.firstChild) host.removeChild(host.firstChild);
      host.appendChild(app.canvas);

      (app as any).__glRecovery = installContextLossRecovery(app.canvas, {
        onRebuild: () => { if (mountIdRef.current === mountId) setGlGeneration((n) => n + 1); },
        onGiveUp: () => {
          console.error('GPU Context lost on office floor canvas.');
        }
      });

      const tilesetTextures = await Promise.all(
        themeTilesetUrls(theme).map(loadTexture),
      );
      if (mountIdRef.current !== mountId) { safeDestroy(app); return; }

      const world = new Container();
      app.stage.addChild(world);

      const mapRenderer = new TiledMapRenderer(resolveThemeMap(theme), tilesetTextures);
      world.addChild(mapRenderer.getContainer());
      const charLayer = mapRenderer.getCharacterContainer();

      const camera = new Camera(world);
      camera.setMapSize(mapRenderer.width * mapRenderer.tileSize, mapRenderer.height * mapRenderer.tileSize);
      camera.setViewSize(app.screen.width, app.screen.height);
      camera.fitToScreen();

      const ts0 = mapRenderer.tileSize;

      // ─── User-Movable & Resizable Server Unit with Permanent Lock ──────────
      const serverRoomG = new Graphics();
      serverRoomG.eventMode = 'static';
      serverRoomG.cursor = 'grab';
      serverRoomG.position.set(31 * ts0, 9 * ts0);
      serverRoomG.zIndex = 13 * ts0;
      charLayer.addChild(serverRoomG);

      const resizeHandleG = new Graphics();
      resizeHandleG.eventMode = 'static';
      resizeHandleG.cursor = 'nwse-resize';
      serverRoomG.addChild(resizeHandleG);

      const lockBtnG = new Graphics();
      lockBtnG.eventMode = 'static';
      lockBtnG.cursor = 'pointer';
      serverRoomG.addChild(lockBtnG);

      const SERVER_STAND_TILE: Tile = { x: 33, y: 13 };

      let serverWidth = 110;
      let serverHeight = 76;

      let isServerLocked = false;
      let isDraggingServer = false;
      let isResizingServer = false;

      lockBtnG.on('pointertap', (ev: any) => {
        ev.stopPropagation();
        isServerLocked = !isServerLocked;
        serverRoomG.cursor = isServerLocked ? 'default' : 'grab';
        resizeHandleG.visible = !isServerLocked;
        drawServerRoom(serverLedClock);
      });

      serverRoomG.on('pointerdown', (ev: any) => {
        if (isServerLocked) return;
        ev.stopPropagation();
        isDraggingServer = true;
        serverRoomG.cursor = 'grabbing';
      });

      resizeHandleG.on('pointerdown', (ev: any) => {
        if (isServerLocked) return;
        ev.stopPropagation();
        isResizingServer = true;
      });

      serverRoomG.on('globalpointermove', (ev: any) => {
        if (isServerLocked) return;

        if (isResizingServer) {
          const localMouse = serverRoomG.toLocal(ev.global);
          serverWidth = Math.max(65, Math.min(320, Math.round(localMouse.x)));
          serverHeight = Math.max(50, Math.min(240, Math.round(localMouse.y)));
          drawServerRoom(serverLedClock);
          return;
        }

        if (isDraggingServer) {
          const local = world.toLocal(ev.global);
          serverRoomG.position.set(local.x - serverWidth / 2, local.y - serverHeight / 2);
          const tile = mapRenderer.pixelToTile(local.x, local.y);
          serverRoomG.zIndex = (tile.y + 1) * ts0;
          SERVER_STAND_TILE.x = tile.x;
          SERVER_STAND_TILE.y = Math.min(tile.y + 1, mapRenderer.height - 1);
        }
      });

      const onServerDragEnd = () => {
        isDraggingServer = false;
        isResizingServer = false;
        if (!isServerLocked) serverRoomG.cursor = 'grab';
      };

      serverRoomG.on('pointerup', onServerDragEnd);
      serverRoomG.on('pointerupoutside', onServerDragEnd);
      resizeHandleG.on('pointerup', onServerDragEnd);
      resizeHandleG.on('pointerupoutside', onServerDragEnd);

      let serverLedClock = 0;
      const drawServerRoom = (tSec: number) => {
        serverRoomG.clear();
        resizeHandleG.clear();
        lockBtnG.clear();

        const w = serverWidth;
        const h = serverHeight;

        // Determine server status from live simulation states
        const simStates = simStatesRef.current || {};
        let srvState: any = simStates['SRV-1'];
        if (!srvState) {
          for (const [id, s] of Object.entries(simStates)) {
            if (id.startsWith('SRV') || id.toLowerCase().includes('server')) {
              srvState = s;
              break;
            }
          }
        }
        const srvStatus = srvState?.status || 'healthy';
        const isServerAttacked = srvStatus === 'compromising' || srvStatus === 'infected';
        const isServerRecovering = srvStatus === 'recovering';
        const isServerHealthy = srvStatus === 'recovered' || srvStatus === 'healthy';

        // ── Fast SOS Morse Code Timing (Unit U = 0.10s) ───────────────────────
        // S = . . . (1U on, 1U off, 1U on, 1U off, 1U on, 3U char gap)  -> 7U total
        // O = — — — (3U on, 1U off, 3U on, 1U off, 3U on, 3U char gap)  -> 14U total
        // S = . . . (1U on, 1U off, 1U on, 1U off, 1U on, 7U word gap)  -> 13U total
        // Total sequence: 34 units (3.40 seconds per SOS loop)
        const MORSE_U = 0.10;
        const MORSE_CYCLE = 34;
        const morseStep = Math.floor((tSec / MORSE_U) % MORSE_CYCLE);

        // Calculate if red LED is ON for current Morse unit
        const isSosLedOn =
          morseStep === 0 || morseStep === 2 || morseStep === 4 ||                   // S (. . .)
          (morseStep >= 8 && morseStep <= 10) ||                                     // O (—)
          (morseStep >= 12 && morseStep <= 14) ||                                    // O (—)
          (morseStep >= 16 && morseStep <= 18) ||                                    // O (—)
          morseStep === 22 || morseStep === 24 || morseStep === 26;                 // S (. . .)

        // Morse letter active currently ('S' | 'O' | 'S' | ' ')
        const morseLetter = morseStep <= 6 ? 'S' : (morseStep >= 8 && morseStep <= 20) ? 'O' : (morseStep >= 22 && morseStep <= 27) ? 'S' : '';

        // ── Server Chassis Color Scheme ──────────────────────────────────────
        // If attacked: default dark steel shifts to RED
        // If recovering: cyan matrix sweep
        // If recovered / healthy: default dark slate & steel
        let frameBg = 0x16161c;
        let frameBorder = isServerLocked ? 0x5ca97a : 0x4f9faf;
        let frameInnerBorder = 0x3d2e4a;
        let headerBg = 0x24242c;
        let headerBorder = isServerLocked ? 0x5ca97a : 0x4f9faf;
        let headerInner = 0x3d2e4a;
        let cabFrame = 0x22222a;
        let cabBorder = 0x4a3b52;
        let cabInner = 0x111116;
        let bladeBg = 0x282c34;

        if (isServerAttacked) {
          // Entire server casing changes into RED
          frameBg = 0x25060a;
          frameBorder = isSosLedOn ? 0xff2222 : 0x991b1b;
          frameInnerBorder = 0x5c0d16;
          headerBg = 0x7f1d1d;
          headerBorder = isSosLedOn ? 0xff3b30 : 0xb91c1c;
          headerInner = 0x991b1b;
          cabFrame = 0x2b0d12;
          cabBorder = 0x7f1d1d;
          cabInner = 0x170407;
          bladeBg = 0x3b0f16;
        } else if (isServerRecovering) {
          frameBg = 0x0c1e28;
          frameBorder = 0x06b6d4;
          frameInnerBorder = 0x155e75;
          headerBg = 0x164e63;
          headerBorder = 0x22d3ee;
          headerInner = 0x0891b2;
          cabFrame = 0x112836;
          cabBorder = 0x0891b2;
          cabInner = 0x08151e;
          bladeBg = 0x155e75;
        }

        // Ambient alarm glow around server when attacked
        if (isServerAttacked && isSosLedOn) {
          serverRoomG.rect(-4, -18, w + 8, h + 22).fill({ color: 0xff0000, alpha: 0.16 });
        }

        // Server Room floor mat & outer casing
        serverRoomG.rect(0, 0, w, h).fill({ color: frameBg, alpha: 0.96 }).stroke({ color: frameBorder, width: isServerAttacked ? 2.5 : 2 });
        serverRoomG.rect(2, 2, w - 4, h - 4).stroke({ color: frameInnerBorder, width: 1 });

        // PC Window Title Bar Header
        serverRoomG.rect(0, -14, w, 14).fill(headerBg).stroke({ color: headerBorder, width: 1 });
        serverRoomG.rect(2, -12, w - 4, 10).fill(headerInner);

        // Emergency Siren Dome on Header (Top right)
        const sirenX = w - 10;
        if (isServerAttacked) {
          serverRoomG.rect(sirenX - 4, -13, 8, 3).fill(0x333333);
          if (isSosLedOn) {
            serverRoomG.circle(sirenX, -15, 6.5).fill({ color: 0xff0000, alpha: 0.55 });
            serverRoomG.circle(sirenX, -15, 3.5).fill(0xff2222);
          } else {
            serverRoomG.circle(sirenX, -15, 3.5).fill(0x7f1d1d);
          }
        } else {
          // Healthy green status beacon on roof
          serverRoomG.circle(sirenX, -7, 2.5).fill(0x22c55e);
        }

        // Lock Position Button on Header
        lockBtnG.position.set(4, -12);
        const lockTextWidth = 56;
        lockBtnG.rect(0, 0, lockTextWidth, 10).fill(isServerLocked ? 0x2e4a36 : 0x4a3b52).stroke({ color: isServerLocked ? 0x5ca97a : 0xdcab3c, width: 1 });

        // Header Alert Badge when server is attacked (displays Morse SOS letters)
        if (isServerAttacked && w >= 130) {
          const badgeX = lockTextWidth + 6;
          serverRoomG.rect(badgeX, -12, 54, 10).fill(isSosLedOn ? 0xb91c1c : 0x450a0a).stroke({ color: 0xef4444, width: 1 });
          // Morse code visual dot/dash feedback
          if (morseLetter === 'S') {
            serverRoomG.circle(badgeX + 16, -7, 1.8).fill(0xffffff);
            serverRoomG.circle(badgeX + 24, -7, 1.8).fill(0xffffff);
            serverRoomG.circle(badgeX + 32, -7, 1.8).fill(0xffffff);
          } else if (morseLetter === 'O') {
            serverRoomG.rect(badgeX + 12, -8, 6, 2.2).fill(0xffffff);
            serverRoomG.rect(badgeX + 22, -8, 6, 2.2).fill(0xffffff);
            serverRoomG.rect(badgeX + 32, -8, 6, 2.2).fill(0xffffff);
          }
        }

        // Dynamically compute cabinet rack columns
        const numCabinets = Math.max(1, Math.floor((w - 12) / 48));
        const cabWidth = Math.floor((w - 12 - (numCabinets - 1) * 6) / numCabinets);

        for (let i = 0; i < numCabinets; i++) {
          const rx = 6 + i * (cabWidth + 6);
          const ry = 4;
          const cabHeight = h - 8;

          // Cabinet frame
          serverRoomG.rect(rx, ry, cabWidth, cabHeight).fill(cabFrame).stroke({ color: cabBorder, width: 1 });
          serverRoomG.rect(rx + 2, ry + 2, cabWidth - 4, cabHeight - 4).fill(cabInner);

          // Server blades & activity LEDs
          const numBlades = Math.max(2, Math.floor((cabHeight - 8) / 11));
          for (let b = 0; b < numBlades; b++) {
            const by = ry + 4 + b * 11;
            serverRoomG.rect(rx + 4, by, cabWidth - 8, 8).fill(bladeBg);

            if (cabWidth >= 28) {
              const ledX1 = rx + cabWidth - 20;
              const ledX2 = rx + cabWidth - 14;
              const ledX3 = rx + cabWidth - 8;
              const ledY = by + 4;

              if (isServerAttacked) {
                // ── ATTACKED: FAST SOS MORSE CODE IN RED LIGHT ─────────────────
                if (isSosLedOn) {
                  // High-intensity neon Red LED + glowing halo
                  serverRoomG.circle(ledX1, ledY, 3.2).fill({ color: 0xff0000, alpha: 0.50 });
                  serverRoomG.circle(ledX1, ledY, 1.6).fill(0xff2222);

                  serverRoomG.circle(ledX2, ledY, 3.2).fill({ color: 0xff0000, alpha: 0.50 });
                  serverRoomG.circle(ledX2, ledY, 1.6).fill(0xff2222);

                  serverRoomG.circle(ledX3, ledY, 3.2).fill({ color: 0xff0000, alpha: 0.50 });
                  serverRoomG.circle(ledX3, ledY, 1.6).fill(0xff2222);
                } else {
                  // Dim / unlit dark maroon LED
                  serverRoomG.circle(ledX1, ledY, 1.4).fill(0x450a0a);
                  serverRoomG.circle(ledX2, ledY, 1.4).fill(0x450a0a);
                  serverRoomG.circle(ledX3, ledY, 1.4).fill(0x450a0a);
                }

                // Dark red blade activity slot
                serverRoomG.rect(rx + 6, by + 3, Math.max(4, cabWidth - 28), 2).fill(isSosLedOn ? 0x991b1b : 0x3d0b12);
              } else if (isServerRecovering) {
                // Recovering matrix sweep
                const sweepOffset = Math.sin(tSec * 6 + b) > 0;
                serverRoomG.circle(ledX1, ledY, 1.5).fill(sweepOffset ? 0x06b6d4 : 0x083344);
                serverRoomG.circle(ledX2, ledY, 1.5).fill(sweepOffset ? 0x38bdf8 : 0x0e3b52);
                serverRoomG.circle(ledX3, ledY, 1.5).fill(sweepOffset ? 0x67e8f9 : 0x164e63);
              } else {
                // ── DEFAULT / RECOVERED: GREEN AND YELLOW LEDS ────────────────
                const greenLed1 = Math.sin(tSec * (4 + i * 2) + b * 1.4) > -0.2;
                const yellowLed = Math.cos(tSec * (7 + i * 3) + b * 2.1) > 0.05;
                const greenLed2 = Math.sin(tSec * 9 + b * 3.2) > -0.15;

                // LED 1: GREEN (Power & Link Status)
                serverRoomG.circle(ledX1, ledY, 1.5).fill(greenLed1 ? 0x22c55e : 0x14532d);
                if (greenLed1) {
                  serverRoomG.circle(ledX1, ledY, 2.5).fill({ color: 0x22c55e, alpha: 0.25 });
                }

                // LED 2: YELLOW (Data Activity / IOPS)
                serverRoomG.circle(ledX2, ledY, 1.5).fill(yellowLed ? 0xeab308 : 0x713f12);
                if (yellowLed) {
                  serverRoomG.circle(ledX2, ledY, 2.5).fill({ color: 0xeab308, alpha: 0.25 });
                }

                // LED 3: GREEN (Network Bus / Heartbeat)
                serverRoomG.circle(ledX3, ledY, 1.5).fill(greenLed2 ? 0x4ade80 : 0x15803d);
                if (greenLed2) {
                  serverRoomG.circle(ledX3, ledY, 2.5).fill({ color: 0x4ade80, alpha: 0.25 });
                }

                // Normal ventilation slot
                serverRoomG.rect(rx + 6, by + 3, Math.max(4, cabWidth - 28), 2).fill(0x1a1e24);
              }
            }
          }
        }

        // Bottom-Right Corner Resize Grip Handle [⇲] (hidden if locked)
        if (!isServerLocked) {
          resizeHandleG.position.set(w - 12, h - 12);
          resizeHandleG.rect(0, 0, 12, 12).fill(isServerAttacked ? 0xef4444 : 0x4f9faf).stroke({ color: 0xffffff, width: 1 });
          resizeHandleG.rect(2, 2, 8, 8).fill(isServerAttacked ? 0x3d0b12 : 0x24242c);
          resizeHandleG.rect(6, 6, 4, 4).fill(isServerAttacked ? 0xff2222 : 0x4f9faf);
        }
      };
      drawServerRoom(0);

      // ─── Visual Water Filter Machine (Breakroom x: 29, y: 15) ─────────────
      const waterFilterG = new Graphics();
      waterFilterG.eventMode = 'none';
      waterFilterG.position.set(29 * ts0, 15 * ts0);
      waterFilterG.zIndex = 16 * ts0;
      charLayer.addChild(waterFilterG);

      const drawWaterFilter = (tSec: number) => {
        waterFilterG.clear();
        // White Machine Stand Base
        waterFilterG.rect(2, 6, 12, 18).fill(0xe8ecef).stroke({ color: 0x87939d, width: 1 });
        waterFilterG.rect(4, 14, 8, 8).fill(0x3e4451);
        waterFilterG.rect(5, 10, 2, 3).fill(0xc94f4f); // hot tap
        waterFilterG.rect(9, 10, 2, 3).fill(0x4f9faf); // cold tap

        // Blue Water Bottle Jug on top
        waterFilterG.rect(4, -4, 8, 10).fill({ color: 0x4f9faf, alpha: 0.85 }).stroke({ color: 0x9fd6f0, width: 1 });
        const waterLevel = Math.sin(tSec * 2) * 1;
        waterFilterG.rect(5, -2 + waterLevel, 6, 6).fill({ color: 0x9fd6f0, alpha: 0.7 });
      };
      drawWaterFilter(0);

      // Wall Calendar
      const calG = new Graphics();
      calG.eventMode = 'static';
      calG.cursor = 'pointer';
      calG.position.set(theme.anchors.calendar.x * ts0 + 8, theme.anchors.calendar.y * ts0 + 5);
      calG.zIndex = 3 * ts0;
      calG.on('pointertap', (ev) => {
        ev.stopPropagation();
        const st = useStore.getState();
        const god = st.agents.find((a) => a.isGod);
        if (god) st.selectAgent(god.id);
      });
      calG.rect(7, -2, 2, 2).fill(0x4a3b52);
      calG.rect(0, 0, 16, 20).fill(0x4a3b52);
      calG.rect(1, 1, 14, 18).fill(0xf2ead8);
      calG.rect(1, 1, 14, 4).fill(0xc94f4f);
      calG.rect(4, 0, 1, 2).fill(0xd8d3c4);
      calG.rect(11, 0, 1, 2).fill(0xd8d3c4);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          calG.rect(2 + c * 3, 7 + r * 4, 2, 2).fill(0xb8ab90);
        }
      }
      calG.rect(8, 11, 2, 2).fill(0xc94f4f);
      charLayer.addChild(calG);

      // Seats & Overflow
      const seatTiles: Tile[] = [];
      const seatSeen = new Set<string>();
      const addSeat = (t?: Tile) => {
        if (!t) return;
        const k = `${t.x},${t.y}`;
        if (seatSeen.has(k)) return;
        seatSeen.add(k);
        seatTiles.push({ x: t.x, y: t.y });
      };
      for (const name of theme.primarySeatNames) addSeat(mapRenderer.getSpawnPoint(name));
      const addZoneSeats = (zone: string) => {
        const z = mapRenderer.getZone(zone);
        if (!z) return;
        for (let y = z.y; y < z.y + z.height; y++) {
          for (let x = z.x; x < z.x + z.width; x++) {
            if (mapRenderer.isWalkable(x, y)) addSeat({ x, y });
          }
        }
      };
      addZoneSeats('boardroom');

      const entrance = mapRenderer.getSpawnPoint('entrance')
        ?? { x: Math.floor(mapRenderer.width / 2), y: mapRenderer.height - 2 };
      const waitTiles: Tile[] = [];
      const waitSeen = new Set<string>();
      for (let radius = 0; radius <= 6 && waitTiles.length < 16; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
            const x = entrance.x + dx, y = entrance.y + dy;
            const k = `${x},${y}`;
            if (waitSeen.has(k)) continue;
            if (mapRenderer.isWalkable(x, y)) { waitSeen.add(k); waitTiles.push({ x, y }); }
          }
        }
      }
      if (waitTiles.length === 0) waitTiles.push(entrance);

      const GOD_SEAT = 0;
      const claimSeat = (agent: Agent): number | null => {
        if (agent.isGod) { seatClaims.add(GOD_SEAT); return GOD_SEAT; }
        for (let i = 1; i < seatTiles.length; i++) {
          if (!seatClaims.has(i)) { seatClaims.add(i); return i; }
        }
        return null;
      };

      const facingForSeat = (t: Tile): 'up' | 'down' | 'left' | 'right' => {
        if (!mapRenderer.isWalkable(t.x, t.y - 1)) return 'up';
        if (!mapRenderer.isWalkable(t.x, t.y + 1)) return 'down';
        if (!mapRenderer.isWalkable(t.x - 1, t.y)) return 'left';
        if (!mapRenderer.isWalkable(t.x + 1, t.y)) return 'right';
        return 'up';
      };

      interface CafeSpot { tile: Tile; facing: Facing; spot: BreakSpot; seated: boolean; partner: number; }
      const cafeSpots: CafeSpot[] = [];

      const faceFurniture = (t: Tile): Facing => {
        if (!mapRenderer.isWalkable(t.x + 1, t.y)) return 'right';
        if (!mapRenderer.isWalkable(t.x - 1, t.y)) return 'left';
        if (!mapRenderer.isWalkable(t.x, t.y - 1)) return 'up';
        return 'down';
      };

      for (const name of theme.cafeSeatNames) {
        const p = mapRenderer.getSpawnPoint(name);
        if (p) cafeSpots.push({ tile: p, facing: facingForSeat(p), spot: 'table', seated: true, partner: -1 });
      }
      for (let i = 0; i < cafeSpots.length; i++) {
        for (let j = i + 1; j < cafeSpots.length; j++) {
          const a = cafeSpots[i].tile, b = cafeSpots[j].tile;
          if (a.x === b.x && Math.abs(a.y - b.y) === 2) { cafeSpots[i].partner = j; cafeSpots[j].partner = i; }
        }
      }
      for (const [name, spot] of theme.cafeStands) {
        const p = mapRenderer.getSpawnPoint(name);
        if (p) cafeSpots.push({ tile: p, facing: faceFurniture(p), spot, seated: false, partner: -1 });
      }

      // Coffee & Water Stations
      const TRAY_TILE: Tile = theme.coffee.trayTile;
      const SINK_TILE: Tile = theme.coffee.sinkTile;
      const MAX_CUPS = theme.coffee.maxCups;
      let cleanCups = MAX_CUPS;

      const trayG = new Graphics();
      trayG.eventMode = 'none';
      trayG.position.set(TRAY_TILE.x * ts0, TRAY_TILE.y * ts0);
      trayG.zIndex = (TRAY_TILE.y + 1) * ts0;
      charLayer.addChild(trayG);
      const drawTray = (): void => {
        trayG.clear();
        const slots: Array<[number, number]> = [[2, 10], [9, 10], [2, 15], [9, 15]];
        for (let i = 0; i < cleanCups && i < slots.length; i++) {
          paintCup(trayG, slots[i][0], slots[i][1]);
        }
      };
      drawTray();

      const sinkG = new Graphics();
      sinkG.eventMode = 'none';
      sinkG.position.set(SINK_TILE.x * ts0, SINK_TILE.y * ts0);
      sinkG.zIndex = (SINK_TILE.y + 1) * ts0;
      charLayer.addChild(sinkG);
      let sinkBusy = 0;
      const drawSink = (tSec: number): void => {
        sinkG.clear();
        sinkG.rect(2, 6, 12, 8).fill(0xb9c2c9);
        sinkG.rect(3, 7, 10, 6).fill(0x87939d);
        sinkG.rect(7, 9, 2, 2).fill(0x5d676f);
        sinkG.rect(7, 2, 2, 4).fill(0x6b7680);
        sinkG.rect(6, 2, 4, 1).fill(0x6b7680);
        if (sinkBusy > 0) {
          sinkG.rect(7, 6, 2, 4).fill({ color: 0x9fd6f0, alpha: 0.9 });
          for (let i = 0; i < 3; i++) {
            const ph = (tSec * 1.2 + i / 3) % 1;
            sinkG.circle(4 + i * 4, 7 - ph * 4, 1).fill({ color: 0xffffff, alpha: 0.7 * (1 - ph) });
          }
        }
      };
      drawSink(0);

      const releaseBreak = (rt: Runtime): void => {
        if (!rt.brk) return;
        rt.brk = undefined;
      };

      const releaseRun = (rt: Runtime): void => {
        if (!rt.run) return;
        rt.run = undefined;
      };

      const releaseErrand = (rt: Runtime): void => {
        if (!rt.err) return;
        rt.err = undefined;
        rt.character.stopWatering();
        rt.character.stopSmoking();
      };

      // Single-Event Scheduled Office Life
      let activeEvent: string | null = null;
      let eventCooldown = 55 + Math.random() * 10;
      let waterWorkerSeqIndex = 0;

      // Sequential Character Rotation Water Drinking Routine
      const triggerWaterBreak = () => {
        const eligible = Array.from(runtimes.entries()).filter(([, rt]) => {
          return !rt.brk && !rt.err && !rt.run && rt.character.isSittingAtDesk();
        });
        if (eligible.length === 0) { activeEvent = null; return; }

        // Pick next worker in sequential rotation
        const selectedPair = eligible[waterWorkerSeqIndex % eligible.length];
        waterWorkerSeqIndex++;

        const [, rt] = selectedPair;
        const originalDeskTile = rt.character.getTilePosition();
        const filterStandTile: Tile = { x: 29, y: 16 }; // Stand tile in breakroom in front of filter

        rt.err = { phase: 'walking', timer: 0, idx: 0 };
        rt.character.setIdle(); // Unseat to walk upright

        // Step 1: Walk across room doorway to Water Filter Machine at {x: 29, y: 16}
        rt.character.walkToAndThen(filterStandTile, () => {
          // Step 2: Face Filter machine & Drink Water
          rt.character.faceDirection('up');
          rt.character.showThought('Filling cup & drinking water 💧');

          setTimeout(() => {
            rt.character.hideThought();
            // Step 3 & 4: Return Walk back to assigned desk
            rt.character.walkToAndThen(originalDeskTile, () => {
              rt.character.sitAtDesk(true);
              rt.err = undefined;
              activeEvent = null;
            });
          }, 5000);
        });
      };

      const triggerOutsideWalk = () => {
        const eligible = Array.from(runtimes.entries()).filter(([, rt]) => {
          return !rt.brk && !rt.err && !rt.run && rt.character.isSittingAtDesk();
        });
        if (eligible.length === 0) { activeEvent = null; return; }

        const [, rt] = eligible[Math.floor(Math.random() * eligible.length)];
        const originalDeskTile = rt.character.getTilePosition();

        rt.err = { phase: 'walking', timer: 0, idx: 0 };
        rt.character.setIdle();
        rt.character.walkToAndThen(entrance, () => {
          rt.character.faceDirection('down');
          rt.character.showThought('getting fresh air 🍃');
          setTimeout(() => {
            rt.character.hideThought();
            rt.character.walkToAndThen(originalDeskTile, () => {
              rt.character.sitAtDesk(true);
              rt.err = undefined;
              activeEvent = null;
            });
          }, 7000);
        });
      };

      const triggerShortChat = () => {
        const eligible = Array.from(runtimes.entries()).filter(([, rt]) => {
          return !rt.brk && !rt.err && !rt.run && rt.character.isSittingAtDesk();
        });
        if (eligible.length < 2) { activeEvent = null; return; }

        const count = Math.min(eligible.length, Math.random() < 0.5 ? 2 : 3);
        const chosen = eligible.sort(() => 0.5 - Math.random()).slice(0, count);

        const meetingTile: Tile = { x: 18, y: 22 };
        let finishedCount = 0;

        chosen.forEach(([, rt], i) => {
          const originalDeskTile = rt.character.getTilePosition();
          const targetTile = { x: meetingTile.x + i, y: meetingTile.y };
          rt.brk = { spotIdx: 0, phase: 'walking', timer: 0, quipTimer: 0 };
          rt.character.setIdle();
          rt.character.walkToAndThen(targetTile, () => {
            rt.character.faceDirection(i === 0 ? 'right' : 'left');
            const thoughts = ['syncing on project targets 📋', 'looks good to me!', 'coffee refill later? ☕', 'ready for deploy 🚀'];
            rt.character.showThought(thoughts[i % thoughts.length]);
            setTimeout(() => {
              rt.character.hideThought();
              rt.character.walkToAndThen(originalDeskTile, () => {
                rt.character.sitAtDesk(true);
                rt.brk = undefined;
                finishedCount++;
                if (finishedCount >= chosen.length) activeEvent = null;
              });
            }, 6000);
          });
        });
      };

      const triggerServerCheck = () => {
        const eligible = Array.from(runtimes.entries()).filter(([, rt]) => {
          return !rt.brk && !rt.err && !rt.run && rt.character.isSittingAtDesk();
        });
        if (eligible.length === 0) { activeEvent = null; return; }

        const [, rt] = eligible[Math.floor(Math.random() * eligible.length)];
        const originalDeskTile = rt.character.getTilePosition();

        rt.err = { phase: 'walking', timer: 0, idx: 0 };
        rt.character.setIdle();
        rt.character.walkToAndThen(SERVER_STAND_TILE, () => {
          rt.character.faceDirection('up');
          rt.character.showThought('checking server logs 🖥️');
          setTimeout(() => {
            rt.character.hideThought();
            rt.character.walkToAndThen(originalDeskTile, () => {
              rt.character.sitAtDesk(true);
              rt.err = undefined;
              activeEvent = null;
            });
          }, 6000);
        });
      };

      const updateScheduledLife = (dt: number) => {
        serverLedClock += dt;
        drawServerRoom(serverLedClock);
        drawWaterFilter(serverLedClock);

        if (activeEvent) return;

        eventCooldown -= dt;
        if (eventCooldown <= 0) {
          eventCooldown = 55 + Math.random() * 10;
          const eventType = Math.floor(Math.random() * 4);
          if (eventType === 0) {
            activeEvent = 'water';
            triggerWaterBreak();
          } else if (eventType === 1) {
            activeEvent = 'outside';
            triggerOutsideWalk();
          } else if (eventType === 2) {
            activeEvent = 'chat';
            triggerShortChat();
          } else {
            activeEvent = 'server';
            triggerServerCheck();
          }
        }
      };

      // Map seat / desk index to corresponding network device ID
      const getNodeForSeat = (seatIdx: number | null): string | null => {
        if (seatIdx === null) return null;
        if (seatIdx === 0) return 'SRV-1';
        if (seatIdx >= 1 && seatIdx <= 8) return `PC-${seatIdx}`;
        if (seatIdx === 9) return 'L-1';
        return `PC-${((seatIdx - 1) % 8) + 1}`;
      };

      // Get real-time attack simulation status and progress for a desk
      const getDeviceStateForSeat = (seatIdx: number | null, agentStatus?: AgentStatus): { status: ScreenStatus; progress: number } => {
        const nodeId = getNodeForSeat(seatIdx);
        const simStates = simStatesRef.current || {};
        const nodeState = nodeId ? simStates[nodeId] : null;

        if (nodeState) {
          if (nodeState.status === 'compromising') {
            return { status: 'compromising', progress: nodeState.progress || 0 };
          }
          if (nodeState.status === 'infected') {
            return { status: 'infected', progress: 100 };
          }
          if (nodeState.status === 'recovering') {
            return { status: 'recovering', progress: nodeState.progress || 0 };
          }
          if (nodeState.status === 'recovered') {
            return { status: 'recovered', progress: 100 };
          }
          if (nodeState.status === 'isolated') {
            return { status: 'offline', progress: 0 };
          }
        }

        // Fallback to agent status in store
        if (agentStatus === 'blocked') {
          return { status: 'infected', progress: 100 };
        }
        if (agentStatus === 'success') {
          return { status: 'recovered', progress: 100 };
        }
        return { status: 'healthy', progress: 0 };
      };

      const deskScreens = new Map<number, DeskScreen>();

      const createScreenOverlay = (seatIdx: number): DeskScreen | undefined => {
        if (deskScreens.has(seatIdx)) return deskScreens.get(seatIdx);
        const seat = seatTiles[seatIdx];
        if (!seat) return undefined;
        let topLeft: Tile | undefined;
        if (mapRenderer.gidAt('furniture-above', seat.x, seat.y - 1) === 365) {
          topLeft = { x: seat.x, y: seat.y - 1 };
        } else if (mapRenderer.gidAt('furniture-above', seat.x - 1, seat.y - 1) === 365) {
          topLeft = { x: seat.x - 1, y: seat.y - 1 };
        } else if (mapRenderer.gidAt('furniture-above', seat.x, seat.y - 2) === 365) {
          topLeft = { x: seat.x, y: seat.y - 2 };
        } else if (mapRenderer.gidAt('furniture-above', seat.x - 1, seat.y - 2) === 365) {
          topLeft = { x: seat.x - 1, y: seat.y - 2 };
        }
        if (!topLeft) return undefined;
        const scr = new DeskScreen(mapRenderer, topLeft, theme.monitor);
        charLayer.addChild(scr.container);
        deskScreens.set(seatIdx, scr);
        return scr;
      };

      // Pre-create screen overlays for all primary desk seats
      for (let i = 0; i < seatTiles.length; i++) {
        createScreenOverlay(i);
      }

      const updateDeskLife = (dt: number): void => {
        const storeAgents = useStore.getState().agents;
        for (const [seatIdx, scr] of deskScreens.entries()) {
          const assignedEntry = Array.from(runtimes.entries()).find(([, rt]) => rt.seatIndex === seatIdx);
          const rt = assignedEntry ? assignedEntry[1] : undefined;
          const agent = assignedEntry ? storeAgents.find(a => a.id === assignedEntry[0]) : undefined;
          const isSeated = rt ? rt.character.isSittingAtDesk() : false;

          const devState = getDeviceStateForSeat(seatIdx, agent?.status);
          scr.setStatus(devState.status, devState.progress);
          scr.setOn(isSeated);
          scr.update(dt);

          if (rt && isSeated) {
            // Trigger panic or recovery on the character sitting at this desk!
            if (devState.status === 'compromising' || devState.status === 'infected') {
              if (!rt.character.isPanic()) {
                rt.character.setPanic(true);
              }
            } else if (rt.character.isPanic()) {
              rt.character.setPanic(false);
            }
          }
        }
      };

      // Desk Hover (pointerover) — opens quick info tooltip
      const floorBg = mapRenderer.getContainer();
      floorBg.eventMode = 'static';

      floorBg.on('pointermove', (ev) => {
        const local = world.toLocal(ev.global);
        const tile = mapRenderer.pixelToTile(local.x, local.y);
        let hoveredDesk = false;
        for (let i = 0; i < seatTiles.length; i++) {
          const st = seatTiles[i];
          if (Math.abs(st.x - tile.x) <= 1 && Math.abs(st.y - tile.y) <= 1) {
            const assignedEntry = Array.from(runtimes.entries()).find(([, rt]) => rt.seatIndex === i);
            const assignedAgentId = assignedEntry ? assignedEntry[0] : undefined;
            const nev = (ev as any).nativeEvent as MouseEvent | undefined;
            const sx = nev ? nev.clientX : ev.global.x;
            const sy = nev ? nev.clientY : ev.global.y;
            useStore.getState().openHoverDesk(i, assignedAgentId, sx, sy);
            hoveredDesk = true;
            break;
          }
        }
        if (!hoveredDesk) {
          useStore.getState().closeHoverDesk();
        }
      });

      floorBg.on('pointerout', () => {
        useStore.getState().closeHoverDesk();
      });

      // Desk Click (pointertap) — opens full control modal on desk click
      floorBg.on('pointertap', (ev) => {
        const local = world.toLocal(ev.global);
        const tile = mapRenderer.pixelToTile(local.x, local.y);

        // Check if a desk was clicked
        for (let i = 0; i < seatTiles.length; i++) {
          const st = seatTiles[i];
          if (Math.abs(st.x - tile.x) <= 1 && Math.abs(st.y - tile.y) <= 1) {
            ev.stopPropagation();
            const assignedEntry = Array.from(runtimes.entries()).find(([, rt]) => rt.seatIndex === i);
            const assignedAgentId = assignedEntry ? assignedEntry[0] : undefined;
            useStore.getState().openDeskMenu(i, st, assignedAgentId);
            return;
          }
        }

        // Standard Floor Click (Walk to tile)
        const selId = useStore.getState().selectedAgentId;
        if (!selId) return;
        const rt = runtimes.get(selId);
        if (!rt || rt.isDragging) return;
        if (mapRenderer.isWalkable(tile.x, tile.y)) {
          releaseBreak(rt);
          releaseErrand(rt);
          releaseRun(rt);
          rt.character.walkToAndThen(tile, () => {
            rt.character.setIdle();
          });
        }
      });

      // Synchronize Agents in store to PixiJS character objects
      const applyState = async () => {
        const state = useStore.getState();
        const currentIds = new Set(state.agents.map((a) => a.id));

        for (const [id, rt] of Array.from(runtimes.entries())) {
          if (!currentIds.has(id)) {
            releaseBreak(rt);
            releaseErrand(rt);
            releaseRun(rt);
            if (rt.seatIndex !== null) seatClaims.delete(rt.seatIndex);
            // Screen is retained in deskScreens for the desk itself
            rt.character.destroy();
            runtimes.delete(id);
          }
        }

        for (const agent of state.agents) {
          let rt = runtimes.get(agent.id);
          if (!rt) {
            const seatIdx = claimSeat(agent);
            const deskTile = seatIdx !== null ? seatTiles[seatIdx] : undefined;

            let waitTile: Tile;
            if (deskTile) {
              waitTile = deskTile;
            } else {
              const freeWait = waitTiles.find((wt) => {
                for (const [, r] of runtimes) {
                  if (r.waitTile.x === wt.x && r.waitTile.y === wt.y) return false;
                }
                return true;
              });
              waitTile = freeWait ?? waitTiles[runtimes.size % waitTiles.length];
            }

            const frames = await getCastFrames(agent.character);

            const character = new Character({
              agentId: agent.id,
              mapRenderer,
              frames,
              seatTile: deskTile ?? waitTile,
              glowColor: colors.accent[agent.accent] ?? colors.accent.lemon,
              onClick: (id) => useStore.getState().selectAgent(id),
            });
            charLayer.addChild(character.sprite.container);

            // Drag & Drop
            character.sprite.container.eventMode = 'static';
            character.sprite.container.cursor = 'pointer';

            let isDraggingChar = false;

            character.sprite.container.on('pointerdown', (ev: any) => {
              ev.stopPropagation();
              useStore.getState().selectAgent(agent.id);
              isDraggingChar = true;
              if (rt) rt.isDragging = true;
            });

            character.sprite.container.on('globalpointermove', (ev: any) => {
              if (!isDraggingChar || !rt) return;
              const local = world.toLocal(ev.global);
              character.sprite.setPosition(local.x, local.y);
            });

            const onDragEnd = (ev: any) => {
              if (!isDraggingChar || !rt) return;
              isDraggingChar = false;
              rt.isDragging = false;
              const local = world.toLocal(ev.global);
              const tile = mapRenderer.pixelToTile(local.x, local.y);

              // Check if dropped near a desk to seat worker
              for (let i = 0; i < seatTiles.length; i++) {
                const st = seatTiles[i];
                if (Math.abs(st.x - tile.x) <= 1 && Math.abs(st.y - tile.y) <= 1) {
                  rt.seatIndex = i;
                  character.sitAtDesk(true);
                  useStore.getState().setAgentSeated(agent.id, true);
                  return;
                }
              }

              if (mapRenderer.isWalkable(tile.x, tile.y)) {
                const pos = mapRenderer.tileToPixel(tile.x, tile.y);
                character.sprite.setPosition(pos.x + ts0 / 2, pos.y + ts0);
              }
            };

            character.sprite.container.on('pointerup', onDragEnd);
            character.sprite.container.on('pointerupoutside', onDragEnd);

            const screen = seatIdx !== null ? createScreenOverlay(seatIdx) : undefined;
            rt = {
              character,
              seatIndex: seatIdx,
              waitTile,
              charName: agent.character,
              screen,
            };
            runtimes.set(agent.id, rt);

            character.sitAtDesk(true);
            character.setStatusGlyph('none');
          }

          // Handle seating & status animations
          const statusChanged = rt.prevStatus !== agent.status;
          const seatedChanged = agent.isSeated !== undefined && rt.character.isSittingAtDesk() !== agent.isSeated;

          if (seatedChanged) {
            if (agent.isSeated === false) {
              // Stand Up action
              rt.character.setIdle();
              const curTile = rt.character.getTilePosition();
              const aisleTile = { x: curTile.x, y: curTile.y + 1 };
              if (mapRenderer.isWalkable(aisleTile.x, aisleTile.y)) {
                rt.character.walkToTile(aisleTile);
              }
            } else {
              // Sit Down action
              rt.character.sitAtDesk(agent.status === 'working');
            }
          }

          if (statusChanged || seatedChanged) {
            if (agent.status === 'blocked') {
              releaseBreak(rt);
              releaseErrand(rt);
              releaseRun(rt);
              rt.character.setStatusGlyph('blocked');
              rt.character.showThought('Blocked ❗');
            } else if (agent.status === 'success') {
              rt.character.setStatusGlyph('success');
              rt.character.showThought('Task Done ✅');
            } else if (agent.status === 'working') {
              releaseBreak(rt);
              releaseErrand(rt);
              releaseRun(rt);
              rt.character.setStatusGlyph('none');
              if (agent.isSeated !== false) rt.character.sitAtDesk(true);
              const activity = liveActivity(agent, 'Coding & Refactoring 💻');
              rt.character.showThought(activity);
            } else if (agent.status === 'thinking') {
              releaseBreak(rt);
              releaseErrand(rt);
              releaseRun(rt);
              rt.character.setStatusGlyph('none');
              if (agent.isSeated !== false) rt.character.sitAtDesk(true);
              rt.character.showThought('Pondering algorithm 💡');
            } else if (agent.status === 'idle') {
              rt.character.setStatusGlyph('none');
              if (agent.isSeated === false) {
                rt.character.setIdle();
              } else {
                rt.character.sitAtDesk(false);
              }
              rt.character.showThought('Taking a break ☕');
            }

            rt.prevStatus = agent.status;
            rt.prevAction = agent.action;
          }
        }
      };

      const unsubscribe = useStore.subscribe(applyState);
      await applyState();

      // Keyboard Arrow Key Movement
      const handleKeyDown = (e: KeyboardEvent) => {
        const selId = useStore.getState().selectedAgentId;
        if (!selId) return;
        const rt = runtimes.get(selId);
        if (!rt) return;

        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -1;
        else if (e.key === 'ArrowDown') dy = 1;
        else if (e.key === 'ArrowLeft') dx = -1;
        else if (e.key === 'ArrowRight') dx = 1;
        else return;

        e.preventDefault();
        const curTile = rt.character.getTilePosition();
        const nextTile = { x: curTile.x + dx, y: curTile.y + dy };

        if (mapRenderer.isWalkable(nextTile.x, nextTile.y)) {
          releaseBreak(rt);
          releaseErrand(rt);
          releaseRun(rt);
          rt.character.moveTo(nextTile);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      // Main Ticker
      const onTick = (ticker: Ticker) => {
        if (pausedRef.current) return;
        const dt = ticker.deltaMS / 1000;

        for (const [, rt] of runtimes) {
          rt.character.update(dt);
        }

        updateScheduledLife(dt);
        updateDeskLife(dt);
        camera.update(dt);

        for (let i = envelopes.length - 1; i >= 0; i--) {
          const env = envelopes[i];
          env.update(dt);
        }
      };

      app.ticker.add(onTick);

      (app as any).__cleanUp = () => {
        unsubscribe();
        window.removeEventListener('keydown', handleKeyDown);
        app.ticker.remove(onTick);
        for (const [, rt] of runtimes) {
          rt.character.destroy();
        }
        for (const scr of deskScreens.values()) {
          scr.destroy();
        }
        deskScreens.clear();
        for (const env of envelopes) env.destroy();
      };
    };

    init().catch((err) => {
      console.error('[OfficeFloor] init failed:', err);
    });

    return () => {
      if (appRef.current) {
        if ((appRef.current as any).__cleanUp) {
          (appRef.current as any).__cleanUp();
        }
        safeDestroy(appRef.current);
        appRef.current = null;
      }
    };
  }, [officeTheme, glGeneration]);

  return (
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1320',
      }}
    />
  );
}