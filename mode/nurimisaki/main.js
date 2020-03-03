define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      const white = this.circle || position.y <= 0;
      if (white && !this.none) {
        change.paint = false;
        change.none = true;
      } else if (!white && !this.paint) {
        change.paint = true;
        change.none = false;
      } else {
        change.paint = false;
        change.none = false;
      }

      return true;
    }

    images(images) {
      if (this.paint) {
        images.push({
          src: "mode/nurimisaki/img/paint.png",
          class: "bg"
        });
      } else if (this.none) {
        images.push({
          src: "mode/nurimisaki/img/none.png",
          class: "bg"
        });
      } else {
        images.push({
          src: "img/cell/floor.png",
          class: "bg"
        });
      }

      if (this.circle) {
        images.push({
          src: "mode/nurimisaki/img/circle.png",
          class: "bg"
        });
        this.numberimage(images);
      }

      return false;
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
        (
          this.isCluster(0, 0) ||
          this.isCluster(0, -1) ||
          this.isCluster(-1, 0) ||
          this.isCluster(-1, -1)
        )
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

      const arounds = [[1,0],[0,1],[1,1]];
      for (const around of arounds) {
        const cell = this.cell(addx+around[0], addy+around[1]);
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
