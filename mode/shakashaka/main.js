define(function() {
  class Board extends BaseBoard {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends BaseCell {
    click(x, y) {
      if (this.wall) {
        return;
      }

      const change = {};

      const dist = Math.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2);
      if (dist <= 0.25) {
        change.triangle = undefined;
        change.none = !this.none;
      } else {
        let triangle = 0;
        if (x >= 0.5) {
          triangle += 1;
        }
        if (y >= 0.5) {
          triangle += 2;
        }
        change.triangle = this.triangle == triangle ? undefined : triangle;
        change.none = false;
      }

      this.update(change);
    }

    images(correction) {
      const images = [];
      if (this.wall) {
        images.push({
          src: "img/cell/wall.png",
          class: "bg"
        });
        if (this.number != null) {
          images.push({
            src: `img/cell/n${this.number}w.png`,
            class: "bg"
          });

          if (correction === true) {
            images.push({
              src: "img/cell/ruleok.png"
            });
          }
        }
      } else {
        images.push({
          src: "img/cell/floor.png",
          class: "bg"
        });
        if (this.triangle !== undefined) {
          images.push({
            src: `mode/shakashaka/img/triangle${this.triangle}.png`
          });
        }
        if (this.none) {
          images.push({
            src: "img/cell/none.png"
          });
        }
      }

      if (correction === false) {
        images.push({
          src: "img/cell/ruleng.png"
        });
      }

      return images;
    }

    arounds() {
      let result = {
        triangle: 0,
        filled: 0
      };

      const arounds = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      for (const around of arounds) {
        const cell = this.cell(around[0], around[1]);
        if (cell == undefined || cell.wall || cell.none) {
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
          if (cell == null || cell.wall || cell[around[0]]) {
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
