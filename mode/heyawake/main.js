define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
    }

    judgment() {
      return (
        this.cells.every(cell => cell.correction(true) !== false) &&
        this.rooms.every(room => room.correction())
      );
    }
  }

  class Cell extends require("app/cell") {
    click(x, y) {
      const change = {};

      if (this.paint) {
        change.paint = false;
        change.none = true;
      } else if (this.none) {
        change.none = false;
      } else {
        change.paint = true;
      }

      this.update(change);
    }

    images(images) {
      images.push({
        src: "img/cell/floor.png",
        class: "bg"
      });

      if (this.paint) {
        images.push({
          src: "mode/heyawake/img/paint.png",
          class: "bg"
        });
        this.correctionimages(images);
      } else if (this.none) {
        images.push({
          src: "mode/heyawake/img/none.png",
          class: "bg"
        });
        this.correctionimages(images);
      }

      if (this.wleft) {
        images.push({
          src: "img/cell/wallleft.png",
          class: "link"
        });
      }
      if (this.wtop) {
        images.push({
          src: "img/cell/walltop.png",
          class: "link"
        });
      }

      this.room.images(this, images);
    }

    correction(strict) {
      if (this.paint) {
        // 塗りが2マス連続していたらNG
        const arounds = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1]
        ];
        for (const around of arounds) {
          if (this.cell(...around).paint) {
            return false;
          }
        }
      } else if (strict || this.none) {
        // 非塗りが3部屋連続していたらNG
        if (this.isTreeWhiteRoom(1, 0, strict)) {
          return false;
        }
        if (this.isTreeWhiteRoom(0, 1, strict)) {
          return false;
        }
      }

      return null;
    }
    isTreeWhiteRoom(addx, addy, strict) {
      const rooms = [];
      rooms.push(this.room.index);
      for (let s = -1; s <= 1; s += 2) {
        for (let c = 1; true; c++) {
          const cell = this.cell(addx * c * s, addy * c * s);
          if (cell.wall || (strict ? cell.paint : !cell.none)) {
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

    set qnum(value) {
      switch (value) {
        case -1:
          break;

        case -2:
          break;

        default:
          this.number = value;
          break;
      }
    }
  }

  class Room extends require("app/room") {
    correction() {
      if (this.qnum == -1) return true;
      return this.qnum == this.cells.filter(cell => cell.paint).length;
    }
  }

  return {
    board: Board,
    cell: Cell,
    room: Room
  };
});
