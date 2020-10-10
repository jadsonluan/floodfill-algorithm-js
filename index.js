const canvas = document.getElementById("content");
const sizeSpan = document.getElementById("size");
const refreshTimeSpan = document.getElementById("refresh-time");
const history = document.getElementById("history");

let ctx = canvas.getContext("2d");

ctx.strokeStyle = 'black';

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
    case 1: return 'deepskyblue';
    case 2: return 'orange';
    default: return 'grey';
  }
}

const drawCell = (position, element) => {
  const row = position.row;
  const col = position.col;
  const topLeft = { x: col * size, y: row * size };
  const bottomRight = { x: topLeft.x + size, y: topLeft.y + size };
  
  ctx.clearRect(topLeft.x, topLeft.y, size, size);

  if (element.left == WALL) drawLine(topLeft, toBottom(topLeft));
  if (element.top == WALL) drawLine(topLeft, toRight(topLeft));
  if (element.right == WALL) drawLine(bottomRight, toTop(bottomRight));
  if (element.bottom == WALL) drawLine(bottomRight, toLeft(bottomRight));
}

const fillCell = (position, element, maze) => {
  const row = position.row;
  const col = position.col;
  const center = size / 2;
  const x = col * size;
  const y = row * size;
  let style;
  if (maze.entrance.row == row && maze.entrance.col == col) {
    style = 'lawngreen';
  } else if (maze.exit.row == row && maze.exit.col == col) {
    style = 'crimson';
  } else {
    style = labelToStyle(element.label);
  }
  
  ctx.fillStyle = style;
  
  const sizeDiv = 2;
  ctx.fillRect(x + (center/sizeDiv), y + (center/sizeDiv), size / sizeDiv, size / sizeDiv);
}

const write = (text) => {
  history.appendChild(document.createElement("br"))
  history.innerHTML += text;
}

function initMaze(n, refreshTime) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  size = 500 / n;
  
  sizeSpan.innerHTML = n;
  refreshTimeSpan.innerHTML = refreshTime;

  new Maze(n, refreshTime, drawCell, fillCell, write);
}

initMaze(10, 100);