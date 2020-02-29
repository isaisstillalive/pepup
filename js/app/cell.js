define(function(require) {
  class Cell {
    constructor(board, x, y) {
      this.board = board;
      this.x = x;
      this.y = y;
    }

    cell(addx, addy) {
      return this.board.get(this.x + addx, this.y + addy);
    }

    update(change) {
      this.board.set(this.x, this.y, change, true);
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
