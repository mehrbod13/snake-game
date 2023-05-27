/******************* CONSTANTS *********************/
const PIXEL = 15;
const BOARD_WIDTH = window.innerWidth;
const BOARD_HEIGHT = window.innerHeight;
const BOARD_COLS = Math.ceil(BOARD_WIDTH / PIXEL);
const BOARD_ROWS = Math.ceil(BOARD_HEIGHT / PIXEL);
const DIRECTIONS = {
  UP: "up",
  DOWN: "bottom",
  LEFT: "left",
  RIGHT: "right",
};
const KEYS = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight",
};
const SNAKE_STATES = {
  STATIC: "static",
  MOVING: "moving",
};
const GAME_STATES = {
  START: "start",
  RUNNING: "running",
  END: "end",
};
const BODY = document.getElementsByTagName("body")[0];
const SNAKEBODY_COLOR = "green";
const SNAKEHEAD_COLOR = "red";
const ABSOLUTE_POSITION = "absolute";
const FOOD_COLOR = "orange";
const SCREEN_WRAPPER_ELEMENT = document.querySelector("#screen-wrapper");
const START_MENU = document.querySelector("#start-menu");
const END_MENU = document.querySelector("#end-menu");
const DISPLAY_NONE = "none";
const DISPLAY_BLOCK = "block";
const DISPLAY_FLEX = "flex";
const MOVE_PERIOD = 100;
const SCORE_PER_FOOD = 10;
/***************************************************/

/******************* VARIABLES *********************/
var SnakeBody = [];
var SnakeStatus = SNAKE_STATES.STATIC;
var SnakeDirection = null;
var headX;
var headY;
var food = null;
var GameStatus = GAME_STATES.START;
var Score = 0;
var HighestScore = localStorage.getItem("high-score") || 0;
/***************************************************/

/******************* FUNCTIONS *********************/
function ExtendBody() {
  var part;
  if (SnakeBody.length === 0) {
    part = {
      x: headX,
      y: headY,
    };
  } else {
    let tail = SnakeBody[SnakeBody.length - 1];
    part = {
      x: tail.x - PIXEL,
      y: tail.y,
    };
  }
  SnakeBody.push(part);
  update();
}

function CenterSnake() {
  headX = Math.floor(BOARD_COLS / 2) * PIXEL;
  headY = Math.floor(BOARD_ROWS / 2) * PIXEL;
}

function move() {
  if (
    GameStatus !== GAME_STATES.RUNNING ||
    SnakeStatus !== SNAKE_STATES.MOVING
  ) {
    return false;
  }

  var ChachedPart = null;
  for (PartIndex = 0; PartIndex < SnakeBody.length; PartIndex++) {
    const part = SnakeBody[PartIndex];
    if (!ChachedPart) {
      ChachedPart = { ...part };
      switch (SnakeDirection) {
        case DIRECTIONS.RIGHT:
          part.x += PIXEL;
          break;
        case DIRECTIONS.LEFT:
          part.x -= PIXEL;
          break;
        case DIRECTIONS.UP:
          part.y -= PIXEL;
          break;
        case DIRECTIONS.DOWN:
          part.y += PIXEL;
      }
      headX = part.x;
      headY = part.y;

      if (IsCollidedWithBorders()) {
        ChangeGameStatus(GAME_STATES.END);
        return false;
      }
      if (IsCollidedWithFood()) {
        ReGenerateFood();
        AddScore(SCORE_PER_FOOD);
      }
    } else {
      let ChachedX = ChachedPart.x;
      let ChachedY = ChachedPart.y;
      ChachedPart = { ...part };
      part.x = ChachedX;
      part.y = ChachedY;
    }
  }
  update();
  setTimeout(() => move(), MOVE_PERIOD);
}

function update() {
  SnakeBody.forEach((part, i) => {
    if (!part.elem) {
      const elem = document.createElement("div");
      elem.style.width = `${PIXEL}px`;
      elem.style.height = `${PIXEL}px`;
      elem.style.background = i === 0 ? SNAKEHEAD_COLOR : SNAKEBODY_COLOR;
      elem.style.position = ABSOLUTE_POSITION;
      part.elem = elem;
      BODY.appendChild(elem);
    }

    part.elem.style.top = `${part.y}px`;
    part.elem.style.left = `${part.x}px`;
  });
}

function HandleKey(e) {
  const key = e.key;
  switch (key) {
    case KEYS.UP:
      SnakeDirection = DIRECTIONS.UP;
      break;
    case KEYS.DOWN:
      SnakeDirection = DIRECTIONS.DOWN;
      break;
    case KEYS.LEFT:
      SnakeDirection = DIRECTIONS.LEFT;
      break;
    case KEYS.RIGHT:
      SnakeDirection = DIRECTIONS.RIGHT;
      break;
  }
}

function GenerateFood() {
  const randomX = Math.floor(Math.random() * BOARD_COLS) * PIXEL;
  const randomY = Math.floor(Math.random() * BOARD_ROWS) * PIXEL;
  const foodElem = document.createElement("div");
  foodElem.style.width = `${PIXEL}px`;
  foodElem.style.height = `${PIXEL}px`;
  foodElem.style.background = FOOD_COLOR;
  foodElem.style.position = ABSOLUTE_POSITION;
  foodElem.style.top = `${randomY}px`;
  foodElem.style.left = `${randomX}px`;
  BODY.appendChild(foodElem);
  food = {
    x: randomX,
    y: randomY,
    elem: foodElem,
  };
}

function IsCollidedWithFood() {
  if (!food) return false;

  const xCheck = headX >= food.x - PIXEL && headX <= food.x + PIXEL;
  const yCheck = headY >= food.y - PIXEL && headY <= food.y + PIXEL;
  return xCheck && yCheck;
}

function RemoveFood() {
  if (food && food.elem) {
    BODY.removeChild(food.elem);
  }
  food = null;
}

function ReGenerateFood() {
  if (food) {
    RemoveFood();
    ExtendBody();
  }

  GenerateFood();
}

function IsCollidedWithBorders() {
  let xCheck = headX <= 0 || headX >= BOARD_WIDTH - PIXEL;
  let yCheck = headY <= 0 || headY >= BOARD_HEIGHT - PIXEL;
  return xCheck || yCheck;
}

function StartGame() {
  ChangeGameStatus(GAME_STATES.RUNNING);
}

function ChangeGameStatus(status) {
  if (GameStatus === status) return;

  GameStatus = status;
  switch (status) {
    case GAME_STATES.RUNNING:
      SCREEN_WRAPPER_ELEMENT.style.display = DISPLAY_NONE;
      START_MENU.style.display = DISPLAY_NONE;
      END_MENU.style.display = DISPLAY_NONE;
      SnakeStatus = SNAKE_STATES.MOVING;
      SnakeDirection = DIRECTIONS.RIGHT;
      Score = 0;
      CenterSnake();
      ExtendBody();
      GenerateFood();
      DrawScoreHud();
      UpdateScoreHud();
      move();

      document.addEventListener("keyup", HandleKey);
      break;
    case GAME_STATES.END:
      SCREEN_WRAPPER_ELEMENT.style.display = DISPLAY_BLOCK;
      END_MENU.style.display = DISPLAY_FLEX;
      START_MENU.style.display = DISPLAY_NONE;
      SnakeStatus = SNAKE_STATES.STATIC;
      SnakeDirection = null;
      RemoveSnakeBody();
      RemoveFood();
      const RestartButton = END_MENU.querySelector("button");
      RestartButton.removeEventListener("click", StartGame);
      RestartButton.addEventListener("click", StartGame);
      break;
  }
}

function RemoveSnakeBody() {
  SnakeBody.forEach((part) => {
    if (part.elem) {
      BODY.removeChild(part.elem);
    }
  });
  SnakeBody = [];
}

function AddScore(score) {
  Score += score;
  if (Score > HighestScore) SetHighScore(Score);
  UpdateScoreHud();
}

function SetHighScore(score) {
  localStorage.setItem("high-score", score);
  HighestScore = score;
}

function DrawScoreHud() {
  const ScoreHud = document.createElement("div");
  ScoreHud.style.display = DISPLAY_FLEX;
  ScoreHud.style.position = ABSOLUTE_POSITION;
  ScoreHud.style.flexDirection = "column";
  ScoreHud.style.top = `${PIXEL}px`;
  ScoreHud.style.left = `${PIXEL}px`;

  const ScoreBar = document.createElement("h1");
  ScoreBar.id = "score";

  const HighestScoreBar = document.createElement("h2");
  HighestScoreBar.id = "highscore";
  HighestScoreBar.style.color = "gray";

  BODY.appendChild(ScoreHud);
  ScoreHud.appendChild(ScoreBar);
  ScoreHud.appendChild(HighestScoreBar);
}

function UpdateScoreHud() {
  const ScoreBar = document.querySelector("#score");
  if (ScoreBar) ScoreBar.innerHTML = Score;

  const HighScore = document.querySelector("#highscore");
  if (HighScore) HighScore.innerHTML = HighestScore;
}

/***************************************************/

/******************* GAME LOGIC ********************/

if (GameStatus === GAME_STATES.START) {
  const StartButton = document.querySelector("#start-menu>button");
  END_MENU.style.display = DISPLAY_NONE;
  START_MENU.style.display = DISPLAY_FLEX;
  StartButton.removeEventListener("click", StartGame);
  StartButton.addEventListener("click", StartGame);
}

/***************************************************/
