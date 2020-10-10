const WALL = 0;
const DOOR = 1;
const DEFAULT_LABEL = 0;
const ENTRANCE_LABEL = 1;
const EXIT_LABEL = 2;

const Direction = {
  LEFT: 'left',
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom'
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function choice(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

function opposite(direction) {
  switch(direction) {
    case Direction.LEFT: return Direction.RIGHT;
    case Direction.TOP: return Direction.BOTTOM;
    case Direction.RIGHT: return Direction.LEFT;
    case Direction.BOTTOM: return Direction.TOP;
    default: return direction;
  }
}

function getAdjacentPosition(position, direction) {
  switch(direction) {
    case Direction.LEFT: return { row: position.row, col: position.col - 1};
    case Direction.TOP: return { row: position.row - 1, col: position.col };
    case Direction.RIGHT: return { row: position.row, col: position.col + 1};
    case Direction.BOTTOM: return { row: position.row + 1, col: position.col};
    default: return position;
  }
}

function random(end) {
  return Math.floor(Math.random() * end);
}

class Cell {
  constructor(left, top, right, bottom, label) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.label = label;
  }
}

class Maze {
  constructor(size) {
    this.size = size;
    this.entrance = { row: random(size), col: 0 };
    this.exit = { row: random(size), col: size - 1 };
    this.maze = this.createMaze(size);
    this.refreshTime = refreshTime;
    this.init();
  }

  createMaze(size) {
    const maze = [];
    for (let i = 0; i < size; i++) {
      maze[i] = [];
      for (let j = 0; j < size; j++) {
        maze[i][j] = new Cell(WALL, WALL, WALL, WALL, DEFAULT_LABEL) 
      }
    }

    return maze;
  }

  async init() {
    console.log("init");
    this.maze.forEach((row, i) => {
      row.forEach((element, j) => {
        this.randomizeWalls({row: i, col: j});
      })
    })

    console.log("entrance", this.entrance);
    console.log("exit", this.exit);

    await this.makeSolvable();
  }

  async makeSolvable() {
    const solved = await this.floodfill(this.entrance, this.exit, 3);
    if (solved) {
      alert("[✅] Esse labirinto tem solução!");
    } else {
      alert("[❌] Esse labirinto não possui solução.");
    }
  }

  async floodfill(from, to, replacementLabel) {
    await sleep(this.refreshTime)

    if (from.row == to.row && from.col == to.col) return true;
    if (!this.inRange(from)) return false;
    if (this.getCell(from).label == replacementLabel) return false;

    const current = this.getCell(from);
    current.label = replacementLabel;

    const directions = [Direction.LEFT, Direction.TOP, Direction.RIGHT, Direction.BOTTOM];

    for (let i = 0; i < directions.length; i++) {
      let direction = directions[i];
      let adjacent = getAdjacentPosition(from, direction);
      let connectedByDoor = current[direction] == DOOR;

      if (this.inRange(adjacent) && connectedByDoor) {
        let solved = await this.floodfill(adjacent, to, replacementLabel);
        if (solved) 
          return true;
      }
    }

    return false;
  }

  randomizeWalls(position) {
    const directions = [Direction.RIGHT, Direction.TOP, Direction.BOTTOM, Direction.LEFT];
    
    directions.forEach(direction => {
      const shouldCreateDoor = choice([true, false]);
      if (shouldCreateDoor) {
        this.createDoor(position, direction);
      }
    })
  }

  inRange(position) {
    const row = position.row;
    const col = position.col;
    return (row >= 0 && row < this.size) && (col >= 0 && col < this.size);
  }

  createDoor(position, direction) {
    if (this.hasBoundaryWall(position, direction)) {
      return false;
    }
    
    const element = this.getCell(position);
    element[direction] = DOOR;

    const neighbor = this.getNeighbor(position, direction);
    neighbor[opposite(direction)] = DOOR;
    return true;
  }

  getNeighbor(position, direction) {
    const neighborPosition = getAdjacentPosition(position, direction);
    return this.getCell(neighborPosition);
  }

  getCell(position) { return this.maze[position.row][position.col]; }

  hasBoundaryWall(position, direction) {
    const row = position.row;
    const col = position.col;
    
    switch(direction) {
      case Direction.LEFT: return col == 0;
      case Direction.TOP: return row == 0;
      case Direction.RIGHT: return col == this.size - 1;
      case Direction.BOTTOM: return row == this.size - 1;
      default: return true;
    }
  }
}