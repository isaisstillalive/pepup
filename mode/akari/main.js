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

    images() {
      const images = [];

      if (this.wall) {
        images.push("wall");
        if (this.number != null) {
          images.push(`number${this.number}w`);
        }
        return images;
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

      return images;
    }

    arounds() {
      let result = {
        light: 0,
        filled: 0
      };

      for (const cell of this.board.around(this.x, this.y)) {
        if (cell.wall || cell.none) {
          result.filled += 1;
        } else if (cell.bright >= 1) {
          result.filled += 1;
          if (cell.light) {
            result.light += 1;
          }
        }
      }

      result.filled = result.filled == 4;

      return result;
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

    correction() {
      // 壁の場合、周囲がすべて埋まり番号と一致していればOK
      // 番号を超えていたらNG
      if (this.wall) {
        if (this.number == null) {
          return true;
        }
        const arounds = this.arounds();
        if (arounds.filled) {
          if (arounds.light == this.number) {
            return true;
          } else {
            return false;
          }
        } else if (arounds.light > this.number) {
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
      this.bright += (value ? 1 : -1);
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
      cell.bright += (value ? 1 : -1);
      cell.setBrights(addx, addy, value);
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
