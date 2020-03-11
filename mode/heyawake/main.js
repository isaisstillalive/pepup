define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
    }
  }

  const cell = require("app/cell");
  const border = require("app/cell/layout/border");
  const fragment = require("app/cell/evaluation/fragment");
  const contiguous = require("app/cell/evaluation/contiguous");

  class Cell extends cell.mixin(border, fragment, contiguous) {
    touch(position, change) {
      if (position.y <= 0) {
        if (this.mark != -1) {
          change.mark = -1;
          return true;
        }
      } else {
        if (this.mark != 1) {
          change.mark = 1;
          return true;
        }
      }

      change.mark = null;
      return true;
    }

    images(images) {
      if (this.mark == 1) {
        images.push("black");
      } else if (this.mark == -1) {
        images.push("white");
      } else {
        images.push("floor");
      }

      this.imagesBorder(images);

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
        if (this.isTreeWhiteRoom(1, 0)) {
          return false;
        }
        if (this.isTreeWhiteRoom(0, 1)) {
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
    isTreeWhiteRoom(addx, addy) {
      const rooms = [];
      rooms.push(this.room.index);
      for (let s = -1; s <= 1; s += 2) {
        for (let c = 1; true; c++) {
          const cell = this.cell(addx * c * s, addy * c * s);
          if (cell.wall || cell.marked != -1) {
            break;
          }
          if (rooms.includes(cell.room.index)) {
            continue;
          }

          rooms.push(cell.room.index);
          if (rooms.length == 3) {
            return true;
          }
        }
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
