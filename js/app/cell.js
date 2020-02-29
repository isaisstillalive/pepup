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

    update(change) {
      this.board.set(this.x, this.y, change, true);
    }

    allimages() {
      const images = [];

      this.images(images);

      return images;
    }

    wallimages(images) {
      if (this.wall) {
        images.push({
          src: "img/cell/wall.png",
          class: "bg"
        });
        if (this.number != null) {
          images.push({
            src: `img/cell/n${this.number}w.png`,
            class: "bg"
          });
          this.correctionimages(images, true);
        }
        return true;
      }
    }

    correctionimages(images, showok = false) {
      const correction = this.correction();
      if (correction === false) {
        images.push({
          src: "img/cell/ruleng.png"
        });
      } else if (showok && correction === true) {
        images.push({
          src: "img/cell/ruleok.png"
        });
      }
    }

    correction() {
      // そのセルが完成していなければnull
      // ルールに則っていればtrue
      // ルールから逸脱していればfalse
      return true;
    }
  }
  return Cell;
});
