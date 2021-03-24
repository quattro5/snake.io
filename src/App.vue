<template>
  <div class="endgame" v-if="die">
    <h2>Вы проиграли!</h2>
    <h2>Ваш счёт: {{ score }}</h2>
    <button @click="start">Начать заново</button>
  </div>

  <div id="score">{{ score }}</div>
  <canvas id="snakeboard" ref="snakeboard" width="400" height="400"></canvas>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      board_border: "black",
      board_background: "white",
      snake_col: "crimson",
      snake_border: "darkblue",

      snake: null,
      snakeInit: [
        { x: 200, y: 200 },
        { x: 190, y: 200 },
        { x: 180, y: 200 },
        { x: 170, y: 200 },
        { x: 160, y: 200 },
      ],

      score: 0,
      changing_direction: false,
      food_x: null,
      food_y: null,
      dx: 10,
      dy: 0,
      snakeboard: this.$refs.snakeboard,
      die: false,
    };
  },

  mounted() {
    this.snakeboard = this.$refs.snakeboard;
    document.addEventListener("keydown", this.change_direction);
    this.start();
  },

  computed: {
    snakeboard_ctx() {
      return this.snakeboard.getContext("2d");
    },

    has_game_ended() {
      for (let i = 4; i < this.snake.length; i++) {
        if (
          this.snake[i].x === this.snake[0].x &&
          this.snake[i].y === this.snake[0].y
        ) {
          return true;
        }
      }
      const hitLeftWall = this.snake[0].x < 0;
      const hitRightWall = this.snake[0].x > this.snakeboard.width - 10;
      const hitToptWall = this.snake[0].y < 0;
      const hitBottomWall = this.snake[0].y > this.snakeboard.height - 10;
      return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
    },
  },

  methods: {
    start() {
      this.score = 0;
      this.die = false;
      this.dx = 10;
      this.dy = 0;
      this.snake = [
        { x: 200, y: 200 },
        { x: 190, y: 200 },
        { x: 180, y: 200 },
        { x: 170, y: 200 },
        { x: 160, y: 200 },
      ];
      this.main();
      this.gen_food();
    },

    main() {
      if (this.has_game_ended) {
        this.die = true;
        return;
      }

      this.changing_direction = false;
      setTimeout(() => {
        this.clear_board();
        this.drawFood();
        this.move_snake();
        this.drawSnake();

        this.main();
      }, 100);
    },

    clear_board() {
      this.snakeboard_ctx.fillStyle = this.board_background;
      this.snakeboard_ctx.strokestyle = this.board_border;
      this.snakeboard_ctx.fillRect(
        0,
        0,
        this.snakeboard.width,
        this.snakeboard.height
      );
      this.snakeboard_ctx.strokeRect(
        0,
        0,
        this.snakeboard.width,
        this.snakeboard.height
      );
    },

    drawSnake() {
      this.snake.forEach(this.drawSnakePart);
    },

    drawFood() {
      const img = new Image();
      img.src = "./assets/apple.png";
      this.snakeboard_ctx.fillStyle = this.snakeboard_ctx.createPattern(
        img,
        "no-repeat"
      );
      this.snakeboard_ctx.strokestyle = "white";
      this.snakeboard_ctx.fillRect(this.food_x, this.food_y, 10, 10);
      this.snakeboard_ctx.strokeRect(this.food_x, this.food_y, 10, 10);
    },

    // Draw one snake part
    drawSnakePart(snakePart) {
      // Set the colour of the snake part
      this.snakeboard_ctx.fillStyle = this.snake_col;
      // Set the border colour of the snake part
      this.snakeboard_ctx.strokestyle = this.snake_border;
      // Draw a "filled" rectangle to represent the snake part at the coordinates
      // the part is located
      this.snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
      // Draw a border around the snake part
      this.snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
    },

    random_food(min, max) {
      return Math.round((Math.random() * (max - min) + min) / 10) * 10;
    },

    gen_food() {
      // Generate a random number the food x-coordinate
      this.food_x = this.random_food(0, this.snakeboard.width - 10);
      // Generate a random number for the food y-coordinate
      this.food_y = this.random_food(0, this.snakeboard.height - 10);
      // if the new food location is where the snake currently is, generate a new food location
      this.snake.forEach((part) => {
        const has_eaten = part.x == this.food_x && part.y == this.food_y;
        if (has_eaten) this.gen_food();
      });
    },

    change_direction(event) {
      const LEFT_KEY = 37;
      const RIGHT_KEY = 39;
      const UP_KEY = 38;
      const DOWN_KEY = 40;

      // Prevent the snake from reversing

      if (this.changing_direction) {
        return;
      }
      this.changing_direction = true;
      const keyPressed = event.keyCode;
      const goingUp = this.dy === -10;
      const goingDown = this.dy === 10;
      const goingRight = this.dx === 10;
      const goingLeft = this.dx === -10;
      if (keyPressed === LEFT_KEY && !goingRight) {
        this.dx = -10;
        this.dy = 0;
      }
      if (keyPressed === UP_KEY && !goingDown) {
        this.dx = 0;
        this.dy = -10;
      }
      if (keyPressed === RIGHT_KEY && !goingLeft) {
        this.dx = 10;
        this.dy = 0;
      }
      if (keyPressed === DOWN_KEY && !goingUp) {
        this.dx = 0;
        this.dy = 10;
      }
    },

    move_snake() {
      const head = {
        x: this.snake[0].x + this.dx,
        y: this.snake[0].y + this.dy,
      };

      this.snake.unshift(head);
      const has_eaten_food =
        this.snake[0].x === this.food_x && this.snake[0].y === this.food_y;
      if (has_eaten_food) {
        this.score += 1;
        this.gen_food();
      } else {
        this.snake.pop();
      }
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Roboto&display=swap");

* {
  font-family: "Roboto", cursive;
}

.endgame {
  position: fixed;
  top: 30%;
  bottom: 30%;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: linear-gradient(to right, #12c2e9, #c471ed, #f64f59);
}

#snakeboard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

#score {
  text-align: center;
  font-size: 50px;
}

.endgame h2 {
  color: white;
  margin: 0 0 30px;
}

button {
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
