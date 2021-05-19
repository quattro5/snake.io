<template>
  <div>
    <div class="bg"></div>

    <div class="menu">
      <div class="logo" v-if="isFirstGame">
        <img
          src="https://sun9-24.userapi.com/impg/suG9AdmaFvF4PSr_8owsAF_dz3tZOufKW_pXjw/akpOPRRCypk.jpg?size=1286x333&quality=96&sign=c5640b0235850fd13ad8a9b10707401e&type=album"
          alt="logo"
          width="600"
        />
      </div>

      <div class="container" v-else>
        <div class="score">Ваш счёт: {{ score * 10 }}</div>
      </div>

      <div class="settings">
        <span>Настройки</span>
        <input
          type="text"
          class="nick"
          v-model="nick"
          placeholder="Введите никнейм"
        />
        <label>
          Цвет змейки
          <input type="color" v-model="color" />
        </label>
        <label>
          Масштаб поля ({{ scale }})
          <input class="scale" type="range" min="10" max="30" v-model="scale" />
        </label>
      </div>

      <button @click="start({ color, scale, nick })">Начать игру</button>
    </div>
  </div>
</template>

<script>
import { getSettings, saveSettings } from "../api";

export default {
  name: "Menu",

  props: {
    start: Function,
    score: Number,
  },

  data() {
    return {
      nick: "",
      color: "#ff0000",
      scale: 16,
    };
  },

  computed: {
    isFirstGame() {
      return !this.score;
    },
  },

  mounted() {
    const sett = getSettings();
    this.nick = sett.nick;
    this.color = sett.color;
    this.scale = sett.scale;
  },

  watch: {
    nick() {
      saveSettings({ nick: this.nick, color: this.color, scale: this.scale });
    },
    color() {
      saveSettings({ nick: this.nick, color: this.color, scale: this.scale });
    },
    scale() {
      saveSettings({ nick: this.nick, color: this.color, scale: this.scale });
    },
  },
};
</script>

<style lang="scss">
.bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  backdrop-filter: blur(4px);
}

button,
input {
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

  &:hover {
    box-shadow: 0 15px 15px #0005;
  }

  &:focus {
    outline: none;
  }
}

.container {
  height: 100px;

  .score {
    margin: 30px;
    font-size: 2rem;
    animation: score_anim 1s infinite alternate ease-in-out;
    user-select: none;
  }

  @keyframes score_anim {
    from {
      transform: rotate(10deg);
      color: #02b7ff;
    }
    50% {
      font-size: 2.4rem;
      color: #ffd500;
    }
    to {
      transform: rotate(-10deg);
      color: chartreuse;
    }
  }
}

.menu {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 800px;
  max-width: 800px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  outline: none;
  box-shadow: 0 0 40px #0005;

  color: white;
  background: linear-gradient(to top, #12c2e9, #c471ed, #f64f59);
  z-index: 1000;

  img {
    border-radius: 100px;
  }
}

.settings {
  display: flex;
  flex-direction: column;
  align-items: center;

  border-radius: 20px;
  border: 2px solid #fff3;
  margin: 20px;
  padding: 15px 30px;
  color: white;
  user-select: none;

  span {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .nick {
    cursor: text;
  }

  input.scale {
    padding: 0 0 !important;
  }

  label {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;

    input {
      margin-left: 12px;
    }
  }
}
</style>
