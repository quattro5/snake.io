<template>
  <Menu :start="start" :score="score" v-if="die" />

  <div class="statistics">
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
    :otherSnakes="otherSnakes"
    :food="food"
  />
</template>

<script>
import SnakeField from "./components/SnakeField.vue";
import Menu from "./components/Menu.vue";
import { sendRequest, subscribeToState } from "./api";

export default {
  name: "App",
  components: {
    SnakeField,
    Menu,
  },

  data() {
    return {
      snake: [],
      otherSnakes: [],

      food: [],
      die: true,
      changingDirection: false,
      score: null,
      startTimeout: 100,

      scale: 16,
      boardWidth: 80,
      boardHeight: 40,
    };
  },

  mounted() {
    document.addEventListener("keydown", this.changeDirection);

    this.snakeInit = [
      { x: 20, y: 20, color: this.snake_col },
      { x: 19, y: 20, color: this.snake_col },
      { x: 18, y: 20, color: this.snake_col },
      { x: 17, y: 20, color: this.snake_col },
      { x: 16, y: 20, color: this.snake_col, head: true, nick: "null" },
    ];

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
      return this.startTimeout - (this.score || 0) / 3;
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

    start(settings) {
      this.snake_col = settings.color || "#000000";
      this.scale = +settings.scale || 16;
      this.nick = settings.nick || "null";

      console.log("start");
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.die = false;

      this.score = null;
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
      this.timer = setTimeout(() => {
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
        color: this.snake_col,
        head: true,
        nick: this.nick,
      };
      this.snake.forEach((part) => (part.head = false));
      this.snake.unshift(head);

      if (this.hasEatenFood(this.snake[0]) !== -1) {
        if (!this.score) this.score = 0;
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
* {
  font-family: cursive;
}

.statistics {
  display: inline-block;
  border-radius: 10px;
  border: 1px solid black;
  padding: 20px;
  color: white;
  background: #0005;
}

body {
  background: url("./assets/grass.jpg");
}
</style>
