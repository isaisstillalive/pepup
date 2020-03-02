define(function(require) {
  const query = location.search.slice(1).split("/");
  const game = query[0];
  const width = Number.parseInt(query[1]);
  const height = Number.parseInt(query[2]);
  const source = query[3];

  requirejs([`../mode/${game}/main`], function(game) {
    const board = new game.board(width, height, source, game.cell, game.room);

    Vue.component("cell", {
      template: "#cell",
      props: {
        x: {
          type: Number
        },
        y: {
          type: Number
        }
      },
      computed: {
        current() {
          return board.get(this.x, this.y);
        },
        images() {
          if (this.current) return this.current.allimages();
        }
      }
    });

    const app = new Vue({
      el: "#app",
      data: {
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
          board
            .get(x, y)
            .click(touchX / clientRect.width, touchY / clientRect.height);
        },
        undo() {
          board.history.undo();
        },
        redo() {
          board.history.redo();
        },
        dispose() {
          board.history.dispose();
          this.pin = false;
        },
        confirm() {
          board.history.confirm();
          this.pin = false;
        },
        judge() {
          if (this.judgment === null) {
            board.judge();
          } else {
            board.resetjudgment();
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
          return board.width;
        },
        height() {
          return board.height;
        },
        doUndo() {
          return board.history.doUndo;
        },
        doRedo() {
          return board.history.doRedo;
        },
        hasPin() {
          return board.history.hasPin;
        },
        pin: {
          get() {
            return board.history.pin;
          },
          set(value) {
            board.history.pin = value;
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
        },
        judgment() {
          return board.judgment;
        }
      }
    });
  });
});
