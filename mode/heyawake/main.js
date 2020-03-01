define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeBorder();
      transcoder.decodeRoomNumber16();
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

    correction() {
      // 塗りが2マス連続していたらNG
      if (this.paint) {
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
        // 非塗りが3部屋連続していたらNG
      } else if (this.none) {
        if (this.isTreeWhiteRoom(1, 0)) {
          return false;
        }
        if (this.isTreeWhiteRoom(0, 1)) {
          return false;
        }
      }

      return null;
    }
    isTreeWhiteRoom(addx, addy) {
      const rooms = [];
      rooms.push(this.room.index);
      for (let s = -1; s <= 1; s += 2) {
        for (let c = 1; true; c++) {
          const cell = this.cell(addx * c * s, addy * c * s);
          if (cell.wall || !cell.none) {
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

  class Room extends require("app/room") {}

  return {
    board: Board,
    cell: Cell,
    room: Room
  };
});
