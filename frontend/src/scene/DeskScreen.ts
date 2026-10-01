import { Container, Graphics, Sprite } from 'pixi.js';
import type { TiledMapRenderer } from './TiledMapRenderer';
import type { MonitorConfig } from './themeRegistry';

// The office tileset ships every desk PC twice: a dark, switched-off monitor
// (gids 365/366 + 381/382 — what the map paints) and the SAME monitor with a
// lit blue desktop (367/368 + 383/384). DeskScreen overlays the lit variant on
// a desk's monitor block while its agent is seated, plus a tiny screen-life
// animation (scrolling lines + a blinking cursor) so the PC visibly works when
// its owner does. Hidden, the map's off art shows through — no state to undo.

/** gid of the OFF monitor block's top-left tile, as painted in the office map.
 *  Default for the office theme; a theme supplies its own via MonitorConfig. */
export const MONITOR_OFF_TOPLEFT_GID = 365;
/** Matching ON tiles for the office theme, laid out 2×2 directly right of the
 *  off block — used when no per-theme MonitorConfig is passed. */
const DEFAULT_ON_GIDS: ReadonlyArray<readonly [number, number, number]> = [
  // [gid, dx, dy] in tiles relative to the block's top-left
  [367, 0, 0], [368, 1, 0],
  [383, 0, 1], [384, 1, 1]
];

/** Screen interior of the 2×2 (32×32px) block, in local pixels — where the
 *  blue desktop is drawn in the tile art. The animation stays inside it. */
const SCREEN = { x: 3, y: 5, w: 25, h: 12 };

export type ScreenStatus = 'healthy' | 'compromising' | 'infected' | 'recovering' | 'recovered' | 'offline';

export class DeskScreen {
  readonly container = new Container();
  private anim = new Graphics();
  private seated = false;
  private status: ScreenStatus = 'healthy';
  private progress: number = 0;
  private t = 0;

  constructor(mapRenderer: TiledMapRenderer, topLeft: { x: number; y: number }, monitor?: MonitorConfig) {
    const ts = mapRenderer.tileSize;
    const onGids = monitor?.onGids ?? DEFAULT_ON_GIDS;
    for (const [gid, dx, dy] of onGids) {
      const tex = mapRenderer.textureForGid(gid);
      if (!tex) continue;
      const s = new Sprite(tex);
      s.x = dx * ts;
      s.y = dy * ts;
      this.container.addChild(s);
    }
    this.anim.eventMode = 'none';
    this.container.addChild(this.anim);
    this.container.x = topLeft.x * ts;
    this.container.y = topLeft.y * ts;
    // Sort with the characters: the block's bottom edge sits above the seated
    // agent's anchor row, so the avatar's head draws over the keyboard, not
    // under it — same painter's order the map art implies.
    this.container.zIndex = (topLeft.y + 2) * ts - 1;
    this.container.visible = false;
    this.container.eventMode = 'none';
  }

  /** Set device attack/recovery simulation status and progress (0-100) */
  setStatus(status: ScreenStatus, progress: number = 0): void {
    this.status = status;
    this.progress = Math.max(0, Math.min(100, progress));
    // Keep monitor screen visible while compromised or infected even if worker leaves
    const isAttacked = this.status === 'compromising' || this.status === 'infected';
    this.container.visible = this.seated || isAttacked;
  }

  /** Light the screen (agent sat down) or cut it (stood up / left). */
  setOn(seated: boolean): void {
    this.seated = seated;
    const isAttacked = this.status === 'compromising' || this.status === 'infected';
    const shouldShow = seated || isAttacked;
    this.container.visible = shouldShow;
    if (!shouldShow) {
      this.anim.clear();
      this.t = 0;
    }
  }

  update(dt: number): void {
    const isAttacked = this.status === 'compromising' || this.status === 'infected';
    if (!this.seated && !isAttacked) return;

    this.t += dt;
    const g = this.anim;
    g.clear();

    // ── 1. ATTACK IN PROGRESS (compromising): Light Red → Full Red progression ──
    if (this.status === 'compromising') {
      const p = Math.max(0.05, Math.min(1, this.progress / 100)); // 0.05 .. 1.0

      // Color interpolation: starts as soft salmon/light-red (255, 140, 140)
      // and transitions to saturated crimson red (210, 15, 15) at 100%
      const r = 255 - Math.round(45 * p);
      const gVal = Math.round(140 * (1 - p) + 15 * p);
      const bVal = Math.round(140 * (1 - p) + 15 * p);
      const tintColor = (r << 16) | (gVal << 8) | bVal;
      const alpha = 0.40 + p * 0.55; // 0.40 (light translucent) -> 0.95 (opaque)

      // Solid color wash over screen interior
      g.rect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h).fill({ color: tintColor, alpha });

      // Scanline glitch effect
      const glitchY = SCREEN.y + (Math.floor(this.t * 12) % SCREEN.h);
      g.rect(SCREEN.x, glitchY, SCREEN.w, 1).fill({ color: 0xffffff, alpha: 0.65 });

      // Secondary flickering glitch stripe
      if (Math.floor(this.t * 8) % 3 === 0) {
        const glitchY2 = SCREEN.y + (Math.floor((this.t * 22) + 4) % SCREEN.h);
        g.rect(SCREEN.x, glitchY2, SCREEN.w, 1).fill({ color: 0xff4444, alpha: 0.8 });
      }

      // Attack progress indicator bar along bottom of screen
      const barW = Math.max(1, Math.round((SCREEN.w - 4) * p));
      g.rect(SCREEN.x + 2, SCREEN.y + SCREEN.h - 2, SCREEN.w - 4, 1).fill({ color: 0x450a0a, alpha: 0.7 });
      g.rect(SCREEN.x + 2, SCREEN.y + SCREEN.h - 2, barW, 1).fill({ color: 0xffffff, alpha: 0.95 });

      // Center flashing warning symbol
      if (Math.floor(this.t * 4) % 2 === 0) {
        const cx = SCREEN.x + Math.floor(SCREEN.w / 2);
        g.rect(cx - 1, SCREEN.y + 2, 2, 4).fill({ color: 0xffffff, alpha: 0.9 });
        g.rect(cx - 1, SCREEN.y + 7, 2, 2).fill({ color: 0xffffff, alpha: 0.9 });
      }
      return;
    }

    // ── 2. ATTACK COMPLETED (infected): FULL BOLD RED SCREEN ────────────────
    if (this.status === 'infected') {
      // Rapid alarm strobe pulsing between vivid scarlet (0xff1e1e) and dark crimson (0x990000)
      const strobe = Math.floor(this.t * 3.5) % 2 === 0;
      const redBg = strobe ? 0xff1e1e : 0x990000;
      g.rect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h).fill({ color: redBg, alpha: 1.0 });

      // Center retro 8-bit skull malware icon (width: 9px, height: 7px)
      const cx = SCREEN.x + Math.floor(SCREEN.w / 2);
      const cy = SCREEN.y + 2;

      // Skull cranium (white)
      g.rect(cx - 4, cy, 9, 4).fill(0xffffff);
      // Eye sockets (black)
      g.rect(cx - 3, cy + 1, 2, 2).fill(0x000000);
      g.rect(cx + 1, cy + 1, 2, 2).fill(0x000000);
      // Teeth / mouth (white with tooth gap)
      g.rect(cx - 3, cy + 5, 7, 2).fill(0xffffff);
      g.rect(cx - 1, cy + 5, 1, 2).fill(0x000000);
      g.rect(cx + 1, cy + 5, 1, 2).fill(0x000000);

      // Warning alert border bar at the bottom
      g.rect(SCREEN.x + 1, SCREEN.y + SCREEN.h - 2, SCREEN.w - 2, 1).fill({
        color: strobe ? 0xffffff : 0x000000,
        alpha: 0.9
      });
      return;
    }

    // ── 3. RECOVERING: Cyan antivirus matrix wipe ──────────────────────────
    if (this.status === 'recovering') {
      const recP = Math.max(0, Math.min(1, this.progress / 100));

      // Dim red background fading away
      g.rect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h).fill({
        color: 0x880000,
        alpha: Math.max(0, 0.85 * (1 - recP))
      });

      // Cyan antivirus wipe advancing from top downward
      const wipeH = Math.round(SCREEN.h * recP);
      if (wipeH > 0) {
        g.rect(SCREEN.x, SCREEN.y, SCREEN.w, wipeH).fill({ color: 0x0284c7, alpha: 0.75 });
        // Leading bright laser scanline
        g.rect(SCREEN.x, SCREEN.y + wipeH - 1, SCREEN.w, 1).fill({ color: 0x38bdf8, alpha: 1.0 });
      }

      // Matrix code particles
      for (let i = 0; i < 3; i++) {
        const ph = (this.t * 5 + i * 7) % SCREEN.w;
        const py = (Math.floor(this.t * 6) + i * 3) % SCREEN.h;
        g.rect(SCREEN.x + Math.round(ph), SCREEN.y + py, 2, 1).fill(0x86efac);
      }
      return;
    }

    // ── 4. HEALTHY / RECOVERED: Default blue screen with scrolling code ────
    // Lines of code scrolling up (cyan, mint green, white) + blinking cursor
    const codeColors = [0x38bdf8, 0x4ade80, 0xfacc15, 0xc084fc, 0xffffff];
    for (let i = 0; i < 3; i++) {
      const phase = (this.t * 2.8 + i * (SCREEN.h / 3)) % SCREEN.h;
      const y = SCREEN.y + SCREEN.h - 1 - phase;
      const indent = (i % 2 === 0) ? 2 : 4;
      const w = 5 + ((i * 5 + Math.floor(this.t / 1.5)) % 11);
      const color = codeColors[(i + Math.floor(this.t / 2)) % codeColors.length];
      g.rect(SCREEN.x + indent, Math.round(y), w, 1).fill({ color, alpha: 0.65 });
    }

    // Blinking terminal prompt / cursor in lower left
    if (Math.floor(this.t / 0.50) % 2 === 0) {
      g.rect(SCREEN.x + 2, SCREEN.y + SCREEN.h - 2, 2, 2).fill({ color: 0xffffff, alpha: 0.95 });
    }
  }

  destroy(): void {
    this.container.destroy({ children: true });
  }
}
