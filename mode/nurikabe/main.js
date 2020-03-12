define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeNumber16();
    }
  }

  const cell = require("app/cell");
  const monochrome = require("app/cell/mark/monochrome");
  const fragment = require("app/cell/evaluation/fragment");
  const cluster = require("app/cell/evaluation/cluster");

  class Cell extends cell.mixin(monochrome, [fragment, -1], cluster) {
    touch(position, change) {
      if (this.number >= 1 || position.y <= 0) {
        return this.changeToWhite(change);
      } else {
        return this.changeToBlack(change);
      }
    }

    images(images) {
      this.imagesMonochrome(images);

      if (this.number !== undefined) {
        images.push("number");
      }
    }

    evaluate() {
      if (this.marked == 1) {
        if (this.number !== undefined) {
          return false;
        }
        return !this.cluster && !this.fragment;
      }

      const { count, numbers } = this.count();
      if (this.number === undefined) {
        if (numbers == 1) {
          return true;
        } else if (this.board.strict || numbers == 0) {
          return false;
        } else {
          return null;
        }
      } else {
        if (this.board.strict && numbers != 1) {
          return false;
        } else if (this.number == "?" || count == this.number) {
          return true;
        } else if (this.board.strict || count < this.number) {
          return false;
        }
      }

      if (this.board.strict) {
        return true;
      } else {
        return null;
      }
    }

    refresh() {
      super.refresh();
      this._count = null;
    }

    count() {
      if (this._count) {
        return this._count;
      }

      const on = [true, true, true, true];

      const it = this.board.recursion(this.x, this.y);
      let result = it.next();
      let count = 0;
      let numbers = 0;
      const cells = [];
      while (!result.done) {
        const cell = result.value;
        if (cell.marked == 1) {
          result = it.next();
          continue;
        }

        cells.push(cell);
        count += 1;
        if (cell.number !== undefined) {
          numbers += 1;
        }
        result = it.next(on);
      }
      const counts = { count: count, numbers: numbers };
      for (const cell of cells) {
        cell._count = counts;
      }

      return counts;
    }

    set qnum(value) {
      switch (value) {
        case -1:
          break;

        case -2:
          this.number = "?";
          break;

        default:
          this.number = value;
          break;
      }
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
