define(function(require) {
  class Room extends require("app/base") {
    constructor(board, index) {
      super(board);

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
  }
  return Room;
});
