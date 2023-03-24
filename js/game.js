const STAGE_COUNT = 2;
const CELL_WIDTH = 50;
const CELL_HEIGHT = 50;

const stage = new URLSearchParams(location.search).get("stage");
const customStageData = sessionStorage.getItem("custom-stage");

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  move(direction) {
    if (!this.#checkDirection(direction)) {
      return;
    }

    if (direction === "up") this.y--;
    else if (direction === "down") this.y++;
    else if (direction === "left") this.x--;
    else if (direction === "right") this.x++;

    canvas.style.top = `calc(50% - 25px - ${this.y * CELL_HEIGHT}px)`;
    canvas.style.left = `calc(50% - 25px - ${this.x * CELL_WIDTH}px)`;

    if (this.x === finishPos[0] && this.y === finishPos[1]) {
      gameOver = true;
    }
  }

  #checkDirection(direction) {
    if (direction === "up") {
      return this.y > 0 && !walls.find((wall) => wall[0] === this.x && wall[1] === this.y - 1);
    } else if (direction === "down") {
      return this.y < stageSize[1] - 1 && !walls.find((wall) => wall[0] === this.x && wall[1] === this.y + 1);
    } else if (direction === "left") {
      return this.x > 0 && !walls.find((wall) => wall[0] === this.x - 1 && wall[1] === this.y);
    } else if (direction === "right") {
      return this.x < stageSize[0] - 1 && !walls.find((wall) => wall[0] === this.x + 1 && wall[1] === this.y);
    }
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x * CELL_WIDTH, this.y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
  }
}

let stageSize = [0, 0];
let playerStartPos = [0, 0];
let finishPos = [0, 0];
let walls = [];

let player;
let gameOver = false;

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let handle;

async function loadStage() {
  let stageData = "";

  if (stage) {
    try {
      stageData = (await import(`./stages/${stage}.js`)).default;
    } catch (err) {
      console.error(err);
      alert("An error occurred while loading stage.");
      return;
    }

    document.title = "Miroh stage " + stage;
  } else if (customStageData) {
    stageData = customStageData;
    document.title = "Miroh custom stage";
  } else {
    alert("No stage data provided.");
    return;
  }

  const splitted = stageData.split("\n");

  stageSize = splitted[0].split("x").map((v) => Number(v));
  stageData = splitted.slice(1).join("\n");

  if (!stageData.split("\n").every((line) => line.length === stageSize[0])
    || stageData.split("\n").length !== stageSize[1]) {
    alert("Stage size is not valid.");
    return;
  }

  canvas.width = CELL_WIDTH * stageSize[0];
  canvas.height = CELL_HEIGHT * stageSize[1];

  if (!stageData) {
    alert("Stage is empty.");
  } else if (!checkStage(stageData.split("\n").join(""))) {
    alert("Stage is not valid.");
  } else {
    startStage();
  }
}

function checkStage(data) {
  const playerStartPositions = Array.from(data.matchAll("2"));
  const finishPositions = Array.from(data.matchAll("3"));
  const wallPositions = Array.from(data.matchAll("1"));

  if (!data.match("2")
    || !data.match("3")
    || playerStartPositions.length > 1
    || finishPositions.length > 1) {
    return false;
  }

  const psIndex = playerStartPositions[0].index;
  playerStartPos[0] = psIndex - (stageSize[0] * Math.floor(psIndex / stageSize[0]));
  playerStartPos[1] = Math.floor(psIndex / stageSize[0]);

  const fIndex = finishPositions[0].index;
  finishPos[0] = fIndex - (stageSize[0] * Math.floor(fIndex / stageSize[0]));
  finishPos[1] = Math.floor(fIndex / stageSize[0]);

  for (let wallPos of wallPositions) {
    const wIndex = wallPos.index;
    walls.push([
      wIndex - (stageSize[0] * Math.floor(wIndex / stageSize[0])),
      Math.floor(wIndex / stageSize[0])
    ]);
  }

  return true;
}

function startStage() {
  player = new Player(playerStartPos[0], playerStartPos[1]);

  const keys = {
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };

  window.addEventListener("keypress", (e) => {
    if (!e.repeat && keys[e.key.toLowerCase()]) {
      player.move(keys[e.key.toLowerCase()]);
    }
  });

  animate();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();
  drawWalls();

  ctx.fillStyle = "darkgreen";
  ctx.fillRect(finishPos[0] * CELL_WIDTH, finishPos[1] * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

  if (gameOver) {
    cancelAnimationFrame(handle);
    clearStage();

    return;
  }

  handle = requestAnimationFrame(animate);
}

function drawWalls() {
  ctx.fillStyle = "white";

  for (let wall of walls) {
    ctx.fillRect(wall[0] * CELL_WIDTH, wall[1] * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
  }
}

function clearStage() {
  const clearText = document.createElement("h3");
  clearText.innerText = "Stage clear!";

  const homeLink = document.createElement("a");
  homeLink.href = "/";
  homeLink.innerText = "Go to home";

  canvas.remove();

  document.body.prepend(clearText);
  document.body.append(homeLink);
}

window.addEventListener("DOMContentLoaded", loadStage);
