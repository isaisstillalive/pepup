define(function(require) {
  const query = location.search.slice(1).split("/");
  const game = query[0];
  const width = Number.parseInt(query[1]);
  const height = Number.parseInt(query[2]);
  const source = query[3];

  requirejs([`../mode/${game}/main`], function(game) {
    Vue.component("cell", {
      template: "#cell",
      props: {
        board: {
          type: game.board
        },
        x: {
          type: Number
        },
        y: {
          type: Number
        }
      },
      computed: {
        current() {
          return this.board.get(this.x, this.y);
        },
        images() {
          if (this.current)
            return this.current.images(this.current.correction());
        }
      }
    });

    const app = new Vue({
      el: "#app",
      data: {
        board: new game.board(width, height, source, game.cell),
        cursor: { x: 0, y: 0 },
        touch: {}
      },
      methods: {
        setCursor(x, y) {
          this.cursor.x = x;
          this.cursor.y = y;
        },
        clickCell(x, y, event) {
          const clientRect = event.currentTarget.getBoundingClientRect();
          const touchX = event.changedTouches[0].clientX - clientRect.left;
          const touchY = event.changedTouches[0].clientY - clientRect.top;
          this.board
            .get(x, y)
            .click(touchX / clientRect.width, touchY / clientRect.height);
        },
        undo() {
          this.board.history.undo();
        },
        redo() {
          this.board.history.redo();
        },
        dispose() {
          this.board.history.dispose();
        },
        confirm() {
          this.board.history.confirm();
        },
        judgment() {
          if (this.board.judgment()) {
            alert("完成");
          } else {
            alert("未完成");
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

          this.cursor.x = Math.min(
            Math.max(0, this.touch.cursorX + Math.floor(movedX / 25)),
            this.width - 1
          );
          this.cursor.y = Math.min(
            Math.max(0, this.touch.cursorY + Math.floor(movedY / 25)),
            this.height - 1
          );
        },
        touchend(event) {
          this.touch = {};
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
                out: x < 0 || x >= this.width || y < 0 || y >= this.height
              });
            }
          }
          return result;
        }
      }
    });
  });
});
