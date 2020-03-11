define(function(require) {
  class Cell extends require("app/base") {
    constructor(board, x, y) {
      super(board);

      this.x = x;
      this.y = y;

      this.wall = false;

      // 書き込まれていればtrue
      // 書き込まれないことが確定していればfalse
      // 未決定ならnull
      this.mark = null;
      this.strictDefaultMark = false;
    }

    cell(addx, addy) {
      return this.board.get(this.x + addx, this.y + addy);
    }

    touch(position, change) {
      return true;
    }

    enter(x, y, change) {
      return;
    }

    update(change) {
      if (this.wall) {
        return;
      }
      let same = true;
      for (const key in change) {
        if (change[key] != this[key]) {
          same = false;
        }
      }
      if (!same) {
        this.board.set(this.x, this.y, change, true);
      }
    }

    allimages() {
      const images = [];

      const showok = this.images(images);
      this.correctionimages(images, showok);

      return images;
    }

    wallimages(images) {
      if (this.wall) {
        images.push("wall");
        if (this.number != null) {
          images.push("number");
        }
        return true;
      }
    }

    correctionimages(images, showok = false) {
      if (this.evaluation === false) {
        images.push("ng");
      } else if (showok && this.evaluation === true) {
        images.push("ok");
      }
    }

    get marked() {
      if (this.mark === null && this.board.strict) {
        return this.strictDefaultMark;
      }
      return this.mark;
    }

    get filled() {
      return this.wall || this.marked !== null;
    }

    aroundMarks() {
      let result = {
        marks: 0,
        opens: 0,
        filled: 0
      };

      for (const cell of this.board.around(this.x, this.y)) {
        if (cell.marked === true) {
          result.marks += 1;
          result.filled += 1;
        } else if (cell.marked === false) {
          result.opens += 1;
          result.filled += 1;
        } else if (cell.filled) {
          result.filled += 1;
        }
      }

      result.filled = result.filled == 4;

      return result;
    }
  }
  return Cell;
});
