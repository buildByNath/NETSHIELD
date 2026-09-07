// Simple office map data
export const OFFICE_MAP = {
  width: 40,
  height: 30,
  tileSize: 16,

  // Walkable tiles (true = walkable, false = blocked)
  // Simple office layout with walls on edges, desks in rows
  getWalkableGrid(): boolean[][] {
    const grid: boolean[][] = [];

    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Walls on edges
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          grid[y][x] = false;
          continue;
        }

        // Desk areas (non-walkable)
        const isDeskArea =
          // Top row of desks
          (y >= 6 && y <= 8 && x >= 4 && x <= 36 && (x - 4) % 8 < 4) ||
          // Bottom row of desks
          (y >= 14 && y <= 16 && x >= 4 && x <= 36 && (x - 4) % 8 < 4) ||
          // Meeting room
          (x >= 2 && x <= 8 && y >= 22 && y <= 27);

        grid[y][x] = !isDeskArea;
      }
    }

    // Desk positions (where characters sit)
    const deskSeats = [
      // Top row
      {x: 6, y: 9}, {x: 14, y: 9}, {x: 22, y: 9}, {x: 30, y: 9},
      // Bottom row
      {x: 6, y: 13}, {x: 14, y: 13}, {x: 22, y: 13}, {x: 30, y: 13},
      // Extra desks
      {x: 36, y: 9}, {x: 36, y: 13},
    ];

    deskSeats.forEach(seat => {
      if (grid[seat.y]) grid[seat.y][seat.x] = true;
    });

    return grid;
  },

  getDeskPositions() {
    return [
      {x: 6, y: 9}, {x: 14, y: 9}, {x: 22, y: 9}, {x: 30, y: 9}, {x: 36, y: 9},
      {x: 6, y: 13}, {x: 14, y: 13}, {x: 22, y: 13}, {x: 30, y: 13}, {x: 36, y: 13},
    ];
  }
};
