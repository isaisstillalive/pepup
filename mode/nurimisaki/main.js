define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeNumber16();
    }
  }

  class Cell extends require("app/cell") {
    constructor(...args) {
      super(...args);
      this.strictDefaultMark = true;
    }

    touch(position, change) {
      if (this.circle || position.y <= 0) {
        if (this.mark !== false) {
          change.mark = false;
          return true;
        }
      } else {
        if (this.mark !== true) {
          change.mark = true;
          return false;
        }
      }

      change.mark = null;
      return true;
    }

    images(images) {
      if (this.mark === true) {
        images.push("black");
      } else if (this.mark === false) {
        images.push("white");
      } else {
        images.push("floor");
      }

      if (this.circle) {
        images.push("circle");
        if (this.number > 0) {
          images.push("number");
        }
      }
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.circle = false;
          this.none = false;
          break;

        case -2:
          this.circle = true;
          this.none = false;
          break;

        default:
          this.circle = true;
          this.none = false;
          this.number = value;
          break;
      }
    }

    white() {
      return this.board.strict ? this.none : !this.paint;
    }

    correction() {
      // 岬の場合、1方のみが白ならOK
      // それ以外ならNG
      if (this.circle) {
        let whites = [];
        const arounds = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1]
        ];
        for (const around of arounds) {
          whites.push(this.countwhite(...around));
        }
        const open = whites.filter(white => white >= 2);
        if (open.length == 1) {
          if (!this.number) {
            return true;
          }
          if (this.number == open[0]) {
            return true;
          } else if (this.number > open[0] || this.board.strict) {
            return false;
          }
          return null;
        } else if (open.length == 0 || this.board.strict) {
          return false;
        }
      }

      // 2*2の塊ができたらNG
      if (
        this.board.strict &&
        (this.isCluster(0, 0) ||
          this.isCluster(0, -1) ||
          this.isCluster(-1, 0) ||
          this.isCluster(-1, -1))
      ) {
        return false;
      }

      return true;
    }

    countwhite(addx, addy) {
      for (let count = 0; true; count++) {
        const cell = this.cell(addx * count, addy * count);
        if (cell.wall || !cell.white()) {
          return count;
        }
      }
    }

    isCluster(addx, addy) {
      const cell = this.cell(addx, addy);
      if (cell.wall) {
        return false;
      }
      const base = cell.white();

      const arounds = [
        [1, 0],
        [0, 1],
        [1, 1]
      ];
      for (const around of arounds) {
        const cell = this.cell(addx + around[0], addy + around[1]);
        if (cell.wall || cell.white() != base) {
          return false;
        }
      }
      return true;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
