<template>
  <canvas id="snakeboard" ref="snakeboard"></canvas>
</template>

<script>
import boardImage from "../assets/sand.jpg";
import foodImage from "../assets/apple.png";

export default {
  name: "SnakeField",
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
    snake: {
      type: Array,
      required: true,
    },
    otherSnakes: {
      type: Array,
      required: true,
    },
    food: {
      type: Array,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },

  emits: ["tick"],

  data() {
    return {
      snake_col: "black",
      board_border: "black",
      snake_border: "darkblue",
    };
  },

  mounted() {
    this.ctx = this.$refs.snakeboard.getContext("2d");
    this.snake_col = this.color;
    this.$refs.snakeboard.width = this.boardWidth;
    this.$refs.snakeboard.height = this.boardHeight;
  },

  computed: {
    boardImage() {
      const img = new Image();
      img.src = boardImage;
      return img;
    },

    foodImage() {
      const img = new Image();
      img.src = foodImage;
      return img;
    },

    boardWidth() {
      return this.width * this.scale;
    },

    boardHeight() {
      return this.height * this.scale;
    },
  },

  methods: {
    update() {
      console.log("updated");
    },

    clearBoard() {
      this.ctx.drawImage(
        this.boardImage,
        0,
        0,
        this.boardWidth,
        this.boardHeight
      );

      this.ctx.strokeStyle = this.board_border;
      this.ctx.strokeRect(0, 0, this.boardWidth, this.boardHeight);
    },

    drawSnakePart(snakePart) {
      this.ctx.fillStyle = snakePart.head ? "red" : this.snake_col;
      this.ctx.strokeStyle = this.snake_border;
      this.ctx.fillRect(
        snakePart.x * this.scale,
        snakePart.y * this.scale,
        this.scale,
        this.scale
      );
      this.ctx.strokeRect(
        snakePart.x * this.scale,
        snakePart.y * this.scale,
        this.scale,
        this.scale
      );
    },

    drawFood(food) {
      this.ctx.drawImage(
        this.foodImage,
        food.x * this.scale,
        food.y * this.scale,
        this.scale,
        this.scale
      );
    },
  },

  watch: {
    snake() {
      this.clearBoard();
      this.snake.forEach(this.drawSnakePart);
      // this.otherSnakes?.forEach(this.drawSnakePart);
      this.food.forEach(this.drawFood);
    },
    otherSnakes() {
      this.otherSnakes?.forEach(this.drawSnakePart);
    },

    food() {
      this.food.forEach(this.drawFood);
    },
  },
};
</script>

<style scoped>
#snakeboard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
