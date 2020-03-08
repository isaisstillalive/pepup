define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeNumber16();
    }
  }

  const cell = require("app/cell");
  const fragment = require("app/cell/correction/fragment");
  const cluster = require("app/cell/correction/cluster");

  class Cell extends cell.mixin([fragment, false], cluster) {
    touch(position, change) {
      if (this.number >= 1 || position.y <= 0) {
        if (this.mark !== false) {
          change.mark = false;
          return true;
        }
      } else {
        if (this.mark !== true) {
          change.mark = true;
          return true;
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

      if (this.number >= 1) {
        images.push("number");
      }
    }

    correction() {
      if (this.marked === true) {
        if (this.number >= 1) {
          return false;
        }
        return !this.cluster && !this.fragment;
      }

      if (this.number >= 1) {
        const count = this.count();
        if (count == this.number) {
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

    count() {
      const on = [true, true, true, true];

      const it = this.board.recursion(this.x, this.y);
      let result = it.next();
      let count = 0;
      while (!result.done) {
        const cell = result.value;
        if (cell.marked === true) {
          result = it.next();
          continue;
        }

        count += 1;
        result = it.next(on);
      }

      return count;
    }

    set qnum(value) {
      switch (value) {
        case -1:
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
