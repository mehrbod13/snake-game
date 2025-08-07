/******************* CONSTANTS *********************/
const PIXEL = 15;
const BOARD_WIDTH = window.innerWidth;
const BOARD_HEIGHT = window.innerHeight;
const PAUSE_ELEM = document.getElementById("pause_menu");
const PAUSE_BUTTON = document.getElementById("pause__btn");
const RESUME_BUTTON = document.getElementById("resume__btn");
const BOARD_COLS = Math.floor(BOARD_WIDTH / PIXEL);
const BOARD_ROWS = Math.floor(BOARD_HEIGHT / PIXEL);
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
  W: "w",
  A: "a",
  S: "s",
  D: "d",
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
var touchStart;
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
  if (GameStatus !== GAME_STATES.RUNNING) {
    return false;
  }

  setTimeout(() => move(), MOVE_PERIOD);

  if (isMobile()) {
    updatePauseMenu();
  }

  if (SnakeStatus === SNAKE_STATES.MOVING) {
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
  }
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
  if (SnakeStatus === SNAKE_STATES.STATIC) return;

  const key = e.key;
  switch (key) {
    case KEYS.UP:
    case KEYS.W:
      SnakeDirection = DIRECTIONS.UP;
      break;
    case KEYS.DOWN: 
    case KEYS.S:
      SnakeDirection = DIRECTIONS.DOWN;
      break;
    case KEYS.LEFT: 
    case KEYS.A:
      SnakeDirection = DIRECTIONS.LEFT;
      break;
    case KEYS.RIGHT:
    case KEYS.D:
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
  let xCheck = headX < 0 || headX > BOARD_WIDTH - PIXEL;
  let yCheck = headY < 0 || headY > BOARD_HEIGHT;
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
      // show pause menu in mobile browser
      if (isMobile()) {
        PAUSE_ELEM.style.display = DISPLAY_BLOCK;
      } else {
        PAUSE_ELEM.style.display = DISPLAY_NONE;
      }
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
      PAUSE_ELEM.style.display = DISPLAY_NONE;
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

//https://stackoverflow.com/questions/11381673/detecting-a-mobile-browsers
function isMobile() {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

// change pause and resume button display 
function updatePauseMenu() {
  if (SnakeStatus === SNAKE_STATES.MOVING) {
    PAUSE_BUTTON.style.display = DISPLAY_BLOCK;
    RESUME_BUTTON.style.display = DISPLAY_NONE;
  } else {
    PAUSE_BUTTON.style.display = DISPLAY_NONE;
    RESUME_BUTTON.style.display = DISPLAY_BLOCK;
  }
}

/***************************************************/

/***************** EVENT LISTENER ******************/

document.addEventListener("keyup", (e) => {
  if (GameStatus !== GAME_STATES.RUNNING) return;

  if (e.key == "Escape") {
    SnakeStatus = SnakeStatus === SNAKE_STATES.MOVING ? SNAKE_STATES.STATIC : SNAKE_STATES.MOVING;
  }
});
PAUSE_BUTTON.addEventListener("click", (e) => {
  SnakeStatus = SNAKE_STATES.STATIC;
});
RESUME_BUTTON.addEventListener("click", (e) => {
  SnakeStatus = SNAKE_STATES.MOVING;
});


document.addEventListener("touchstart", (e) => {
  const touches = e?.changedTouches;
  if (touches.length !== 0) {
    const touch = touches[0];
    touchStart = touch;
  }
});
document.addEventListener("touchend", (e) => {
  const touches = e?.changedTouches;
  if (touches.length !== 0 && touchStart) {
    const touch = touches[0];
    const xChange = touchStart.pageX - touch.pageX;
    const yChange = touchStart.pageY - touch.pageY;

    if (Math.abs(xChange) < 10 && Math.abs(yChange) < 10) {
      return;
    }

    if (Math.abs(xChange) > Math.abs(yChange)) {
      SnakeDirection = xChange < 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
    } else {
      SnakeDirection = yChange < 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
    }
  }
});

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