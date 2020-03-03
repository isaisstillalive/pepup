define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      if (position.distance <= 0.25) {
        if (!this.none) {
          change.triangle = undefined;
          change.none = true;
          return true;
        }
      } else {
        let triangle = 0;
        if (position.x >= 0) {
          triangle += 1;
        }
        if (position.y >= 0) {
          triangle += 2;
        }
        if (this.triangle != triangle) {
          change.triangle = triangle;
          change.none = false;
          return false;
        }
      }

      change.triangle = undefined;
      change.none = false;
      return true;
    }

    images(images) {
      images.push({
        src: "img/cell/floor.png",
        class: "bg"
      });

      if (this.triangle !== undefined) {
        images.push({
          src: `mode/shakashaka/img/triangle${this.triangle}.png`
        });
      } else if (this.none) {
        images.push({
          src: "img/cell/none.png"
        });
      }

      return false;
    }

    arounds() {
      let result = {
        triangle: 0,
        filled: 0
      };

      for (const cell of this.board.around(this.x, this.y)) {
        if (cell.wall || cell.none) {
          result.filled += 1;
        } else if (cell.triangle !== undefined) {
          result.filled += 1;
          result.triangle += 1;
        }
      }

      result.filled = result.filled == 4;

      return result;
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.wall = false;
          this.triangle = undefined;
          this.none = false;
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
          if (arounds.triangle == this.number) {
            return true;
          } else {
            return false;
          }
        } else if (arounds.triangle > this.number) {
          return false;
        }
        return null;
      }

      const arounds = [
        ["left", [1, 0]],
        ["right", [-1, 0]],
        ["top", [0, 1]],
        ["bottom", [0, -1]]
      ];
      for (const around of arounds) {
        if (this[around[0]]) {
          const cell = this.cell(...around[1]);
          if (cell.wall || cell[around[0]]) {
            return false;
          }
        }
      }

      return null;
    }

    get left() {
      return this.triangle !== undefined && this.triangle % 2 == 0;
    }
    get right() {
      return this.triangle !== undefined && this.triangle % 2 == 1;
    }
    get top() {
      return this.triangle !== undefined && this.triangle < 2;
    }
    get bottom() {
      return this.triangle !== undefined && this.triangle >= 2;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
