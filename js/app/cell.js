define(function(require) {
  class Cell extends require("app/base") {
    constructor(board, x, y) {
      super(board);

      this.x = x;
      this.y = y;

      this.wall = false;

      // 書き込まれていれば1以上
      // 書き込まれないことが確定していれば-1
      // 未決定ならnull
      this.mark = null;
      this.strictDefaultMark = -1;
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

    tap(change) {
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
      if (!this.mark && this.board.strict) {
        return this.strictDefaultMark;
      }
      return this.mark;
    }

    get filled() {
      return this.wall || !!this.marked;
    }
  }
  return Cell;
});
