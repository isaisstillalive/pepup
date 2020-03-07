define(function(require) {
  class Cell {
    constructor(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;

      this.wall = false;

      // 書き込まれていればtrue
      // 書き込まれないことが確定していればfalse
      // 未決定ならnull
      this.mark = null;
    }

    static strictDefaultMark = false;
    static fragmentDivideMark = true;

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
      if (this.corrected === false) {
        images.push("ng");
      } else if (showok && this.corrected === true) {
        images.push("ok");
      }
    }

    refresh() {
      this._correction = false;
      this._fragment = null;
    }

    get corrected() {
      if (!this._correction) {
        this._corrected = this.correction();
        this._correction = true;
      }
      if (this.board.strict) {
        return !!this._corrected;
      }
      return this._corrected;
    }

    get fragment() {
      if (this._fragment === null) {
        this.board.checkFragment(this.constructor.fragmentDivideMark);
      }
      return this._fragment;
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

    get marked() {
      if (this.mark === null && this.board.strict) {
        return this.constructor.strictDefaultMark;
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

    get wright() {
      const cell = this.board.get(this.x + 1, this.y);
      return cell.wall || cell.wleft;
    }
    get wbottom() {
      const cell = this.board.get(this.x, this.y + 1);
      return cell.wall || cell.wtop;
    }
  }
  return Cell;
});
