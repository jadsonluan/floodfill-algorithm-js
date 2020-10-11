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
  constructor(size, refreshTime, drawCell, fillCell) {
    this.size = size;
    this.entrance = { row: random(size), col: 0 };
    this.exit = { row: random(size), col: size - 1 };
    this.maze = this.createMaze(size);
    this.refreshTime = refreshTime;
    this.drawCell = drawCell;
    this.fillCell = fillCell;
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
    this.maze.forEach((row, i) => {
      row.forEach((element, j) => {
        this.randomizeWalls({row: i, col: j});
        this.drawCell({row: i, col: j}, element);
      })
    })

    fillCell(this.entrance, this.getCell(this.entrance), this);
    fillCell(this.exit, this.getCell(this.exit), this);

    await this.makeSolvable();
  }

  async makeSolvable() {
    let solved = false;
    let fromEntrance = true;
    
    while (true) {
      this.clearLabels();
      console.log("🌊 Iniciando FloodFill a partir da entrada procurando a célula de saída.");
      solved = await this.floodfill(this.entrance, this.exit, ENTRANCE_LABEL);
      if (solved) break;

      console.log("❌ Solução não encontrada.");
      console.log("🌊 Iniciando FloodFill a partir da saída procurando uma célula com label da entrada.");
      solved = await this.floodfill(this.exit, this.entrance, EXIT_LABEL, ENTRANCE_LABEL);
      if (solved) continue;
      
      this.clearLabels();
      console.log("❌ Solução não encontrada.");
      
      if (fromEntrance) {
        console.log("🌊 Iniciando FloodFill a partir da entrada procurando uma célula sem label para quebrar uma parede.");
        await this.floodfill(this.entrance, this.exit, ENTRANCE_LABEL, DEFAULT_LABEL);
      } else {
        console.log("🌊 Iniciando FloodFill a partir da saída procurando uma célula sem label para quebrar uma parede.");
        await this.floodfill(this.exit, this.entrance, EXIT_LABEL, DEFAULT_LABEL)
      }

      fromEntrance = !fromEntrance
    }

    console.log("✅ Esse labirinto tem solução!");
  }

  clearLabels() {
    this.maze.forEach((row, i) => {
      row.forEach((element, j) => {
        element.label = DEFAULT_LABEL;
        this.drawCell({row: i, col: j}, element);
        this.fillCell({row: i, col: j}, element, this);
      })
    })
  }

  async floodfill(from, to, replacementLabel, targetLabel=undefined) {
    if (from.row == to.row && from.col == to.col) return true;
    if (!this.inRange(from)) return false;
    if (targetLabel != undefined && this.findAndBreakWall(from, targetLabel)) return true;    
    if (this.getCell(from).label == replacementLabel) return false;
    
    const current = this.getCell(from);
    current.label = replacementLabel;
    this.fillCell(from, current, this)

    const directions = [Direction.RIGHT, Direction.TOP, Direction.BOTTOM, Direction.LEFT];
    await sleep(this.refreshTime)
    for (let i = 0; i < directions.length; i++) {
      let direction = directions[i];
      let adjacent = getAdjacentPosition(from, direction);
      let connectedByDoor = current[direction] == DOOR;

      if (this.inRange(adjacent) && connectedByDoor) {
        let solved = await this.floodfill(adjacent, to, replacementLabel, targetLabel);
        if (solved) 
          return true;
      }
    }

    return false;
  }

  findAndBreakWall(position, targetLabel) {
    const directions = [Direction.LEFT, Direction.TOP, Direction.RIGHT, Direction.BOTTOM];
    
    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i];
      let adjacent = getAdjacentPosition(position, direction);

      if (!this.inRange(adjacent)) continue;
      let neighbor = this.getCell(adjacent); 

      if (neighbor.label == targetLabel && 
          neighbor[opposite(direction)] == WALL && 
          this.createDoor(position, direction)
      ) {
        console.log(`🚪 Criando uma porta em ${adjacent.row} ${adjacent.col}`);
        return true;
      }
    }

    return false;
  }

  randomizeWalls(position) {
    const directions = [Direction.RIGHT, Direction.TOP, Direction.BOTTOM, Direction.LEFT];
    
    directions.forEach(direction => {
      const shouldCreateDoor = choice([true, false, false]);
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

    const neighborPosition = getAdjacentPosition(position, direction);
    const neighbor = this.getCell(neighborPosition, direction);
    neighbor[opposite(direction)] = DOOR;

    this.drawCell(position, element);
    this.drawCell(neighborPosition, neighbor);

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