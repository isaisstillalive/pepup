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

      if (this.light) {
        change.light = false;
        change.none = true;
      } else if (this.none) {
        change.none = false;
      } else {
        change.light = true;
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
        if (this.bright >= 1) {
          images.push({
            src: "mode/akari/img/bright.png",
            class: "bg"
          });
        }
        if (this.light) {
          images.push({
            src: "mode/akari/img/light.png"
          });
          if (this.bright >= 2) {
            images.push({
              src: "img/cell/ruleng.png"
            });
          }
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
        light: 0,
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
      this.dlight = value;
      this.ray(value);
    }
    get light() {
      return this.dlight;
    }

    ray(value) {
      Vue.set(this, "bright", this.bright + (value ? 1 : -1));
      this.setBrights(1, 0, value);
      this.setBrights(-1, 0, value);
      this.setBrights(0, 1, value);
      this.setBrights(0, -1, value);
    }

    setBrights(addx, addy, value) {
      let x = addx;
      let y = addy;
      while (true) {
        const cell = this.cell(x, y);
        if (cell == undefined || cell.wall) {
          break;
        }
        Vue.set(cell, "bright", cell.bright + (value ? 1 : -1));
        x += addx;
        y += addy;
      }
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
