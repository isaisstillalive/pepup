define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      if (position.y <= 0) {
        if (this.mark !== false) {
          change.mark = false;
          return true;
        }
      } else {
        if (this.mark !== true) {
          change.mark = true;
          return false;
        }
      }

      change.mark = null;
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

      if (this.mark === true) {
        images.push("light");
      } else if (this.mark === false) {
        images.push("none");
      }
    }

    correction() {
      const wall = this.correctionWall();
      if (wall !== null) {
        return wall;
      }

      // 明かりの場合、床が2回光っていればNG
      if (this.marked) {
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

    get filled() {
      return super.filled || this.bright >= 1;
    }

    set mark(value) {
      if (!!value != !!this._mark) {
        this.ray(value ? 1 : -1);
      }
      this._mark = value;
    }
    get mark() {
      return this._mark;
    }

    ray(addbright) {
      this.bright += addbright;
      this.setBrights(1, 0, addbright);
      this.setBrights(-1, 0, addbright);
      this.setBrights(0, 1, addbright);
      this.setBrights(0, -1, addbright);
    }

    setBrights(addx, addy, addbright) {
      const cell = this.cell(addx, addy);
      if (cell.wall) {
        return;
      }
      cell.bright += addbright;
      cell.setBrights(addx, addy, addbright);
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.bright = 0;
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
