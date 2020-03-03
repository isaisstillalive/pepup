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
      data() {
        return { board: board };
      },
      computed: {
        current() {
          return this.board.get(this.x, this.y);
        },
        images() {
          if (this.current) return this.current.allimages();
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
      methods: {
        setCursor(x, y) {
          this.markleave(x, y);

          this.cursor.x = x;
          this.cursor.y = y;

          this.markupdate();
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
          this.pin = false;
        },
        confirm() {
          this.board.history.confirm();
          this.pin = false;
        },
        judge() {
          if (this.judgment === null) {
            this.board.judge();
          } else {
            this.board.resetjudgment();
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
            id: event.changedTouches[0].identifier,
            pageX: event.changedTouches[0].pageX,
            pageY: event.changedTouches[0].pageY,
            multicell: false,
            freeze: false,
            change: {}
          };
          this.markmove(event);
        },
        markmove(event) {
          if (this.mark.freeze) {
            return;
          }

          const touch = Array.from(event.changedTouches).find(
            touch => touch.identifier == this.mark.id
          );
          if (touch === undefined) {
            return;
          }

          const position = {
            x: touch.pageX - this.mark.pageX,
            y: touch.pageY - this.mark.pageY,
            get distance() { return Math.sqrt((this.x - 0.5) ** 2 + (this.y - 0.5) ** 2) },
            get degree() { return Math.atan2(this.y, this.x) * 180 / Math.PI; }
          };

          const cell = this.board.get(this.cursor.x, this.cursor.y);
          this.mark.multicell = cell.touch(position, this.mark.change);
        },
        markend(event) {
          if (!this.mark.freeze) {
            this.mark.multicell = true;
            this.markupdate();
          }
          this.mark = undefined;
        },
        markleave(x, y) {
          if (!this.mark || this.mark.freeze) {
            return;
          }

          this.mark.freeze = true;

          const cell = this.board.get(this.cursor.x, this.cursor.y);
          cell.leave(x-this.cursor.x, y-this.cursor.y, this.mark.change);
          cell.update(this.mark.change);
        },
        markupdate() {
          if (!this.mark || !this.mark.multicell) {
            return;
          }

          const cell = this.board.get(this.cursor.x, this.cursor.y);
          cell.update(this.mark.change);
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
        },
        judgment() {
          return this.board.judgment;
        }
      }
    });
  });
});
