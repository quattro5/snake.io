<template>
  <div class="endgame" v-if="die">
    <h2>Вы проиграли!</h2>
    <h2>Ваш счёт: {{ score }}</h2>
    <button @click="start">Начать заново</button>
  </div>

  <div class="score">
    <div>Ваш счёт: {{ score }}</div>
    <div>Длина змеи: {{ snake?.length ?? 0 }}</div>
    <div>Еды на карте: {{ food.length }}</div>
    <div>Задержка: {{ timeout.toFixed(2) }}</div>
    <div>Скорость: {{ speed }}</div>
  </div>

  <snake-field
    :scale="scale"
    :width="boardWidth"
    :height="boardHeight"
    :snake="snake"
    :color="snake_col"
    :otherSnakes="otherSnakes"
    :food="food"
  />
</template>

<script>
import SnakeField from "./components/SnakeField.vue";
import { sendRequest, subscribeToState } from "./api";

export default {
  name: "App",
  components: {
    SnakeField,
  },

  data() {
    return {
      snake: null,
      otherSnakes: [],

      food: [],
      die: false,
      changingDirection: false,
      score: 0,
      startTimeout: 100,

      scale: 16,
      boardWidth: 80,
      boardHeight: 40,

      snake_col: "crimson",
    };
  },

  mounted() {
    document.addEventListener("keydown", this.changeDirection);

    this.snakeInit = [
      { x: 20, y: 20 },
      { x: 19, y: 20 },
      { x: 18, y: 20 },
      { x: 17, y: 20 },
      { x: 16, y: 20, head: true },
    ];

    this.start();

    subscribeToState((data) => this.updateState(data));
  },

  computed: {
    endGame() {
      for (let i = 4; i < this.snake.length; i++) {
        if (
          this.snake[i].x === this.snake[0].x &&
          this.snake[i].y === this.snake[0].y
        ) {
          return true;
        }
      }

      for (let i = 0; i < this.otherSnakes.length; i++) {
        if (
          this.otherSnakes[i].x === this.snake[0].x &&
          this.otherSnakes[i].y === this.snake[0].y
        ) {
          return true;
        }
      }
      const hitLeftWall = this.snake[0].x < 0;
      const hitTopWall = this.snake[0].y < 0;
      const hitRightWall = this.snake[0].x > this.boardWidth;
      const hitBottomWall = this.snake[0].y > this.boardHeight;
      return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
    },

    timeout() {
      return this.startTimeout; //- this.score / 3;
    },

    speed() {
      return (1 - this.timeout / 100 + 1).toFixed(3);
    },
  },

  methods: {
    updateState(newState) {
      this.otherSnakes = newState.snakes;
      if (!newState.food) {
        return;
      }

      this.food = newState.food;
    },

    start() {
      console.log("start");
      this.die = false;

      this.score = 0;
      this.dx = 1;
      this.dy = 0;
      this.snake = JSON.parse(JSON.stringify(this.snakeInit));

      this.gameTimeout();
    },

    gameTimeout() {
      this.food = [...this.food];
      this.snake = [...this.snake];
      this.otherSnakes = [...this.otherSnakes];

      if (this.endGame) {
        this.die = true;
        return;
      }

      this.changingDirection = false;
      setTimeout(() => {
        this.moveSnake();
        this.gameTimeout();

        sendRequest({
          action: "changeSnake",
          snakes: this.snake,
        });
      }, this.timeout);
    },

    eatenFood() {
      this.snake.slice(0, 1).forEach((part) => {
        const has_eaten = this.hasEatenFood(part);
        if (has_eaten !== -1) {
          sendRequest({
            action: "eatenFood",
            deletedFood: this.food[has_eaten],
            deletedFoodId: has_eaten,
          });
        }
      });
    },

    changeDirection(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

      if (this.changingDirection) {
        return;
      }
      this.changingDirection = true;

      const keyPressed = event.keyCode;
      const goingUp = this.dy === -1;
      const goingDown = this.dy === 1;
      const goingRight = this.dx === 1;
      const goingLeft = this.dx === -1;

      if (keyPressed === LEFT_KEY && !goingRight) {
        this.dx = -1;
        this.dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        this.dx = 0;
        this.dy = -1;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        this.dx = 1;
        this.dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        this.dx = 0;
        this.dy = 1;
      }
    },

    moveSnake() {
      const head = {
        x: this.snake[0].x + this.dx,
        y: this.snake[0].y + this.dy,
        head: true,
      };
      this.snake.forEach((part) => (part.head = false));
      this.snake.unshift(head);

      if (this.hasEatenFood(this.snake[0]) !== -1) {
        this.score += 1;
        this.eatenFood();
      } else {
        this.snake.pop();
      }
    },

    hasEatenFood(part) {
      let i = -1;
      this.food.forEach((f, idx) => {
        if (part.x === f.x && part.y === f.y && i === -1) {
          i = idx;
        }
      });
      return i;
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

* {
  font-family: "Roboto", cursive;
}

/*body {*/
/*  background: url("./assets/grass.jpg");*/
/*}*/

.endgame {
  position: fixed;
  top: 30%;
  bottom: 30%;
  left: 0;
  right: 0;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
}

.score {
  position: absolute;
  top: 50%;
  left: 20%;
  transform: translate(-50%, -50%);
  font-size: 26px;
  z-index: 2;
}

.endgame h2 {
  color: white;
  margin: 0 0 30px;
}

button {
  display: flex;
  align-items: center;

  cursor: pointer;
  font-size: 1.2rem;
  padding: 10px 50px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(0deg, white, #eee);
  box-shadow: 0 10px 10px #0003;
  transition: all 0.5s ease;
}

button:hover {
  box-shadow: 0 15px 15px #0005;
}
</style>
