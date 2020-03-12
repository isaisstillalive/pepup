define(function(require) {
  const query = location.search.slice(1).split("/");
  let mode = query[0];
  const width = Number.parseInt(query[1]);
  const height = Number.parseInt(query[2]);
  const source = query[3];

  if (mode == "lightup") {
    mode = "akari";
  }

  requirejs([`../mode/${mode}/main`], function(game) {
    const board = new game.board(width, height, source, game.cell, game.room);

    Vue.component("svg-img", {
      template: "#svg",
      props: {
        visibles: {
          type: Array
        },
        value: {
          type: [Number, String]
        }
      },
      data() {
        return {
          data: `mode/${mode}/cell.svg`
        };
      },
      mounted() {
        this.layers = {};
        const svg = this.$refs.svg;
        svg.onload = () => {
          const layers = svg.contentDocument.querySelectorAll("svg > g");
          for (const layer of layers) {
            this.layers[layer.id] = layer;
          }
          this.valuelayer = svg.contentDocument.querySelector("#number-value");
          this.refresh();
        };
      },
      watch: {
        visibles() {
          this.refresh();
        },
        value() {
          this.refresh();
        }
      },
      methods: {
        refresh() {
          if (this.valuelayer) this.valuelayer.textContent = this.value;
          for (const layer in this.layers) {
            this.layers[layer].style.display = "none";
          }
          for (const layer of this.visibles) {
            this.layers[layer].style.display = "block";
          }
        }
      }
    });

    Vue.component("cell", {
      template: "#cell",
      props: {
        x: {
          type: Number
        },
        y: {
          type: Number
        },
        cursor: {
          type: Boolean,
          default: false
        },
        visibled: {
          type: Boolean,
          default: true
        }
      },
      data() {
        const current = board.get(this.x, this.y);
        return {
          board: board,
          current: current,
          number: current.number
        };
      },
      watch: {
        x() {
          this.current = board.get(this.x, this.y);
        },
        y() {
          this.current = board.get(this.x, this.y);
        },
        current() {
          this.number = this.current.number;
        }
      },
      computed: {
        images() {
          if (!this.visibled) {
            return ["wall"];
          }

          const images = this.current.allimages();
          if (this.cursor) {
            images.push("cursor");
          }
          return images;
        }
      }
    });

    const app = new Vue({
      el: "#app",
      data: {
        board: board,
        cursor: { x: 0, y: 0 },
        touch: {}
      },
      created() {
        window.addEventListener("keydown", this.onkey);
      },
      beforeDestroy() {
        window.removeEventListener("keydown", this.onkey);
      },
      methods: {
        setCursor(x, y) {
          if (this.cursor.x == x && this.cursor.y == y) {
            return;
          }

          this.markenter(x, y);

          this.cursor.x = x;
          this.cursor.y = y;
        },
        onkey(event) {
          let x = this.cursor.x;
          let y = this.cursor.y;
          switch (event.key) {
            case "ArrowLeft":
              x = Math.max(0, x - 1);
              break;
            case "ArrowRight":
              x = Math.min(this.width - 1, x + 1);
              break;
            case "ArrowUp":
              y = Math.max(0, y - 1);
              break;
            case "ArrowDown":
              y = Math.min(this.height - 1, y + 1);
              break;

            default:
              return;
          }
          this.setCursor(x, y);
        },
        undo() {
          this.board.history.undo();
        },
        redo() {
          this.board.history.redo();
        },
        dispose() {
          this.board.history.dispose();
          this.pin = false;
        },
        confirm() {
          this.board.history.confirm();
          this.pin = false;
        },
        evaluate() {
          if (this.evaluation === null) {
            this.board.evaluate();
          } else {
            this.board.resetEvaluation();
          }
        },
        touchstart(event) {
          this.touch = {
            id: event.changedTouches[0].identifier,
            startX: event.changedTouches[0].pageX,
            startY: event.changedTouches[0].pageY,
            cursorX: this.cursor.x,
            cursorY: this.cursor.y
          };
        },
        touchmove(event) {
          const touch = Array.from(event.changedTouches).find(
            touch => touch.identifier == this.touch.id
          );
          if (touch === undefined) {
            return;
          }
          const movedX = touch.pageX - this.touch.startX;
          const movedY = touch.pageY - this.touch.startY;

          const x = Math.min(
            Math.max(0, this.touch.cursorX + Math.floor(movedX / 25)),
            this.width - 1
          );
          const y = Math.min(
            Math.max(0, this.touch.cursorY + Math.floor(movedY / 25)),
            this.height - 1
          );
          this.setCursor(x, y);
        },
        touchend(event) {
          this.touch = {};
        },

        markstart(event) {
          this.mark = {
            multicell: false,
            change: {},
            cursorX: this.cursor.x,
            cursorY: this.cursor.y
          };

          const clientRect = event.currentTarget.getBoundingClientRect();

          const position = {
            x:
              (event.changedTouches[0].pageX -
                (clientRect.x + clientRect.width / 2)) /
              clientRect.width,
            y:
              (event.changedTouches[0].pageY -
                (clientRect.y + clientRect.height / 2)) /
              clientRect.height,
            get distance() {
              return Math.sqrt(this.x ** 2 + this.y ** 2);
            },
            get angle() {
              return Math.atan2(this.y, this.x) / Math.PI;
            }
          };
          this.mark.position = position;

          const cell = this.board.get(this.cursor.x, this.cursor.y);
          this.mark.multicell = cell.touch(
            position,
            this.mark.change,
            this.mark
          );

          cell.update(this.mark.change);
        },
        markend(event) {
          if (this.mark.cursorX == this.cursor.x &&
            this.mark.cursorY == this.cursor.y) {
            const cell = this.board.get(this.cursor.x, this.cursor.y);
            cell.tap(
              this.mark.position,
              this.mark.change,
              this.mark
            );
            cell.update(this.mark.change);
          }
          this.mark = undefined;
        },
        markenter(x, y) {
          if (!this.mark || !this.mark.multicell) {
            return;
          }

          const cell = this.board.get(x, y);
          const change = Object.assign({}, this.mark.change);
          cell.enter(this.cursor.x - x, this.cursor.y - y, change, this.mark);
          cell.update(change);
        }
      },
      computed: {
        width() {
          return this.board.width;
        },
        height() {
          return this.board.height;
        },
        doUndo() {
          return this.board.history.doUndo;
        },
        doRedo() {
          return this.board.history.doRedo;
        },
        hasPin() {
          return this.board.history.hasPin;
        },
        pin: {
          get() {
            return this.board.history.pin;
          },
          set(value) {
            this.board.history.pin = value;
          }
        },
        cellsize() {
          return Math.floor(Math.min(320 / this.width, 430 / this.height));
        },
        boardsize() {
          return {
            width: this.cellsize * this.width + "px",
            height: this.cellsize * this.height + "px"
          };
        },
        controlcells() {
          const result = [];
          for (let y = this.cursor.y - 1; y <= this.cursor.y + 1; y++) {
            for (let x = this.cursor.x - 1; x <= this.cursor.x + 1; x++) {
              result.push({
                x: x,
                y: y,
                visibled: x >= 0 && x < this.width && y >= 0 && y < this.height
              });
            }
          }
          return result;
        },
        evaluation() {
          return this.board.evaluation;
        }
      }
    });
  });
});
