const query = location.search.slice(1).split("/");
const game = query[0];
const width = query[1];
const height = query[2];
const data = query[3];

requirejs([`../mode/${game}/main`], function(game) {
  // Safariのスクロール禁止
  window.addEventListener("touchmove", event => event.preventDefault(), {
    passive: false
  });

  Vue.component("cell", {
    template: "#cell",
    props: {
      map: {
        type: Array
      },
      x: {
        type: Number
      },
      y: {
        type: Number
      }
    },
    mixins: [game.cell]
  });

  const app = new Vue({
    el: "#app",
    mixins: [game.board],
    data: {
      width: Number.parseInt(width),
      height: Number.parseInt(height),
      data: data,
      map: [],
      border: 1
    },
    computed: {
      cellsize() {
        return Math.floor(
          Math.min(
            (320 - this.border) / this.width,
            (430 - this.border) / this.height
          ) - this.border
        );
      },
      boardsize() {
        return {
          width:
            (this.cellsize + this.border) * this.width + 3 * this.border + "px",
          height:
            (this.cellsize + this.border) * this.height + 3 * this.border + "px"
        };
      }
    }
  });
});
