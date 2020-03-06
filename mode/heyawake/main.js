define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      if (position.y <= 0 && this.mark !== false) {
        change.mark = false;
      } else if (position.y > 0 && this.mark !== true) {
        change.mark = true;
      } else {
        change.mark = null;
      }

      return true;
    }

    images(images) {
      if (this.marked === true) {
        images.push("black");
      } else if (this.marked === false) {
        images.push("white");
      } else {
        images.push("floor");
      }

      if (this.wleft) {
        images.push("lborder");
      }
      if (this.wtop) {
        images.push("tborder");
      }
      if (this.wright) {
        images.push("rborder");
      }
      if (this.wbottom) {
        images.push("bborder");
      }

      if (this.number >= 0) {
        images.push("number");
      }
    }

    correction() {
      if (this.marked === true) {
        // 塗りが2マス連続していたらNG
        for (const cell of this.board.around(this.x, this.y)) {
          if (cell.marked === true) {
            return false;
          }
        }
        return true;
      }

      if (this.marked === false) {
        // 非塗りが3部屋連続していたらNG
        if (this.isTreeWhiteRoom(1, 0)) {
          return false;
        }
        if (this.isTreeWhiteRoom(0, 1)) {
          return false;
        }
      }

      // 塗りの中に非塗があればNG
      if (this.isBlocked()) {
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
          if (cell.wall || cell.marked !== false) {
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
    isBlocked() {
      const walls = [true, true, true, true];

      const on = [true, true, true, true];

      // すべての壁に接していればOK、それ以外はNG
      const it = this.board.recursion(this.x, this.y);
      let result = it.next();
      while (!result.done) {
        const cell = result.value;
        if (cell.marked === true) {
          result = it.next();
          continue;
        }

        if (cell.x == 0) {
          walls[0] = false;
        } else if (cell.x == this.board.width - 1) {
          walls[1] = false;
        }
        if (cell.y == 0) {
          walls[2] = false;
        } else if (cell.y == this.board.height - 1) {
          walls[3] = false;
        }

        result = it.next(on);
      }

      return walls.some(value => value);
    }

    get number() {
      if (this == this.room.cells[0]) return this.room.qnum;
    }
  }

  class Room extends require("app/room") {
    correction() {
      if (this.qnum == -1) return true;
      return (
        this.qnum == this.cells.filter(cell => cell.marked === true).length
      );
    }
  }

  return {
    board: Board,
    cell: Cell,
    room: Room
  };
});
