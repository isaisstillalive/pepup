define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      if (position.y <= 0) {
        if (!this.none) {
          change.light = false;
          change.none = true;
          return true;
        }
      } else {
        if (!this.light) {
          change.light = true;
          change.none = false;
          return false;
        }
      }

      change.light = false;
      change.none = false;
      return true;
    }

    images(images) {
      if (this.wallimages(images)) {
        return true;
      }

      images.push("floor");

      if (this.bright >= 1) {
        images.push("bright");
      }

      if (this.light) {
        images.push("light");
      } else if (this.none) {
        images.push("none");
      }
    }

    correction() {
      // 壁の場合、周囲がすべて埋まり番号と一致していればOK
      // 番号を超えていたらNG
      if (this.wall) {
        if (this.number == null) {
          return true;
        }
        const arounds = this.aroundMarks();
        if (arounds.filled) {
          if (arounds.marks == this.number) {
            return true;
          } else {
            return false;
          }
        } else if (arounds.marks > this.number) {
          return false;
        }
        return null;
      }

      // 明かりの場合、床が2回光っていればNG
      if (this.light) {
        if (this.bright >= 2) {
          return false;
        }
        return true;
      }

      // 床の場合、1回以上光っていればOK
      if (this.bright >= 1) {
        return true;
      }
      return null;
    }

    get marked() {
      return this.light;
    }

    get filled() {
      return (
        this.board.strict ||
        this.wall ||
        this.none ||
        this.bright >= 1 ||
        this.marked
      );
    }

    set light(value) {
      if (value == this.dlight) {
        return;
      }
      this.dlight = value;
      this.ray(value);
    }
    get light() {
      return this.dlight;
    }

    ray(value) {
      this.bright += value ? 1 : -1;
      this.setBrights(1, 0, value);
      this.setBrights(-1, 0, value);
      this.setBrights(0, 1, value);
      this.setBrights(0, -1, value);
    }

    setBrights(addx, addy, value) {
      const cell = this.cell(addx, addy);
      if (cell.wall) {
        return;
      }
      cell.bright += value ? 1 : -1;
      cell.setBrights(addx, addy, value);
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.wall = false;
          this.none = false;
          this.bright = 0;
          this.dlight = false;
          break;

        case -2:
          this.wall = true;
          break;

        default:
          this.wall = true;
          this.number = value;
          break;
      }
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
