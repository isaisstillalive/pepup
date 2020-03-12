define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
    }
  }

  const cell = require("app/cell");
  const line = require("app/cell/mark/line");
  const border = require("app/cell/layout/border");
  const straddleRoom = require("app/cell/evaluation/straddle_room");

  class Cell extends cell.mixin(border, line, [straddleRoom, 2, [-1]]) {
    tap(position, change, opt) {
      if (position.distance <= 0.3) {
        change.mark = null;
        if (position.y <= 0) {
          if (this.mark != -1) {
            change.mark = -1;
          }
        } else {
          if (this.mark != 1) {
            change.mark = 1;
          }
        }
      } else {
        this.tapLine(position, change, opt);
      }
    }

    images(images) {
      images.push("floor");

      this.imagesBorder(images);
      this.imagesLine(images);

      if (this.mark == 1) {
        images.push("exist");
      } else if (this.mark == -1) {
        images.push("none");
      }

      if (this.number >= 0) {
        images.push("number");
      }
    }

    evaluate() {
      if (this.marked == -1) {
        // 非塗りが2部屋連続していたらNG
        if (!this.straddleRoom) {
          return false;
        }
      }
      return true;
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
