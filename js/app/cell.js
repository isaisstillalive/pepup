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
      this.strictDefaultMark = false;
    }

    static mixin(...modules) {
      let klass = this;
      for (let mod of modules) {
        const args = [klass];
        if (Array.isArray(mod)) {
          const opt = mod;
          mod = opt.shift();
          args.push(...opt);
        }
        klass = mod(...args);
      }
      return klass;
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

    refresh() {
      this._evaluated = false;
    }
    updateEvaluation() {
      if (!this._evaluated) {
        let c = this.evaluate();
        if (this.board.strict) {
          c = !!c;
        }
        if (this.evaluation != c) {
          Vue.set(this, "evaluation", c);
        }
        this._evaluated = true;
      }
    }

    evaluate() {
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
