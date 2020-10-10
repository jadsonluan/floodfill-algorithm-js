const canvas = document.getElementById("content");
let ctx = canvas.getContext("2d");

ctx.strokeStyle = 'brown';

const n = 20;
const size = 500 / n;

function toLeft(start) { return { x: start.x - size, y: start.y } }
function toTop(start) { return { x: start.x, y: start.y - size } }

function toRight(start) { return { x: start.x + size, y: start.y } }
function toBottom(start) { return { x: start.x, y: start.y + size } }

function drawLine(from, to) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}
  
function labelToStyle(label) {
  switch(label) {
    case 0: return 'white';
    case 1: return 'lawngreen';
    case 2: return 'crimson';
    default: return 'grey';
  }
}

function drawCell(row, col, element) {
  const topLeft = { x: col * size, y: row * size };
  const bottomRight = { x: topLeft.x + size, y: topLeft.y + size };
  if (element.left == WALL) drawLine(topLeft, toBottom(topLeft));
  if (element.top == WALL) drawLine(topLeft, toRight(topLeft));
  if (element.right == WALL) drawLine(bottomRight, toTop(bottomRight));
  if (element.bottom == WALL) drawLine(bottomRight, toLeft(bottomRight));
}

function fillCell(row, col, element, maze) {
  const center = size / 2;
  const x = col * size;
  const y = row * size;
  let label = element.label;
  if (maze.entrance.row == row && maze.entrance.col == col) {
    label = 1;
  } else if (maze.exit.row == row && maze.exit.col == col) {
    label = 2;
  }
  ctx.fillStyle = labelToStyle(label);
  ctx.fillRect(x + (center/2), y + (center/2), size / 2, size / 2);
}

// drawLine({x: 0, y: 0}, {x: size, y: 0});

function cell(left, top, right, bottom) { return { left, top, right, bottom }}

function emptyCell() { return new Cell(WALL, WALL, WALL, WALL); }

// const maze = [
//   [ new Cell(WALL, WALL, DOOR, WALL), new Cell(DOOR, WALL, WALL, DOOR), new Cell(WALL, WALL, WALL, WALL) ],
//   [ new Cell(WALL, WALL, WALL, WALL), new Cell(WALL, DOOR, WALL, WALL), new Cell(WALL, WALL, WALL, WALL) ],
//   [ new Cell(WALL, WALL, WALL, WALL), new Cell(WALL, WALL, WALL, WALL), new Cell(WALL, WALL, WALL, WALL) ]
// ]

function drawMaze(maze) {
  maze.maze.forEach((row, i) => {
    row.forEach((element, j) => {
      drawCell(i, j, element);
      fillCell(i, j, element, maze);
    })
  })
}

const refreshTime = 100;
const maze = new Maze(n, refreshTime);

setInterval(() => drawMaze(maze), refreshTime);
