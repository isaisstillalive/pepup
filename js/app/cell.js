define(function(require) {
  class Cell {
    constructor(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;

      this.wall = false;
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
      let correction = this.correction();
      if (this.board.strict) {
        correction = !!correction;
      }
      if (correction === false) {
        images.push("ng");
      } else if (showok && correction === true) {
        images.push("ok");
      }
    }

    correction() {
      // そのセルが完成していなければnull
      // ルールに則っていればtrue
      // ルールから逸脱していればfalse
      return true;
    }

    correctionWall() {
      // 壁の場合、周囲がすべて埋まり番号と一致していればOK
      // 番号を超えていたらNG
      if (!this.wall) {
        return null;
      }

      if (this.number == null) {
        return true;
      }

      const arounds = this.aroundMarks();
      if (arounds.filled) {
        if (arounds.marks == this.number) {
          return true;
        } else {
          return false;
        }
      } else if (arounds.marks > this.number) {
        return false;
      }

      return null;
    }

    aroundMarks() {
      let result = {
        marks: 0,
        filled: 0
      };

      for (const cell of this.board.around(this.x, this.y)) {
        if (cell.marked) {
          result.marks += 1;
          result.filled += 1;
        } else if (cell.filled) {
          result.filled += 1;
        }
      }

      result.filled = result.filled == 4;

      return result;
    }

    get wright() {
      return this.board.get(this.x + 1, this.y).wleft;
    }
    get wbottom() {
      return this.board.get(this.x, this.y + 1).wtop;
    }
  }
  return Cell;
});
