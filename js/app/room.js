define(function(require) {
  class Room extends require("app/base") {
    constructor(board, index) {
      super();

      this.board = board;
      this.index = index;

      this.cells = [];
    }

    addCell(cell) {
      cell.room = this;
      this.cells.push(cell);
    }

    images(cell, images) {
      if (this.cells[0] != cell) {
        return;
      }
      if (this.qnum >= 0) {
        images.push({
          src: `img/cell/n${this.qnum}w.png`,
          class: "bg"
        });
      }
    }

    evaluate() {
      // その部屋が完成していなければnull
      // ルールに則っていればtrue
      // ルールから逸脱していればfalse
      return true;
    }
  }
  return Room;
});
