define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
    }
  }

  const cell = require("app/cell");
  const border = require("app/cell/layout/border");
  const monochrome = require("app/cell/mark/monochrome");
  const fragment = require("app/cell/evaluation/fragment");
  const contiguous = require("app/cell/evaluation/contiguous");
  const straddleRoom = require("app/cell/evaluation/straddle_room");

  class Cell extends cell.mixin(
    border,
    monochrome,
    fragment,
    [contiguous],
    [straddleRoom, 3, [-1]]
  ) {
    touch(position, change) {
      if (position.y <= 0) {
        return this.changeToWhite(change);
      } else {
        return this.changeToBlack(change);
      }
    }

    images(images) {
      this.imagesBorder(images);
      this.imagesMonochrome(images);

      if (this.number >= 0) {
        images.push("number");
      }
    }

    evaluate() {
      if (this.marked == 1) {
        return !this.contiguous;
      }

      if (this.marked == -1) {
        // 非塗りが3部屋連続していたらNG
        if (!this.straddleRoom) {
          return false;
        }
      }

      // 塗りの中に非塗があればNG
      if (this.fragment) {
        return false;
      }

      if (this.board.strict) {
        return true;
      } else {
        return null;
      }
    }

    get number() {
      if (this.wall) return null;
      if (this == this.room.cells[0]) return this.room.qnum;
    }
  }

  class Room extends require("app/room") {
    evaluate() {
      if (this.qnum == -1) return true;
      return this.qnum == this.cells.filter(cell => cell.marked == 1).length;
    }
  }

  return {
    board: Board,
    cell: Cell,
    room: Room
  };
});
