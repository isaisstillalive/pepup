define(function() {
  class Board extends BaseBoard {
    decode(source) {
      this.decode4Cell(source);
      for (let c = 0; c < this.data.length; c++) {
        const cell = this.data[c];
        if (cell.number == -1) {
          cell.wall = false;
          cell.none = false;
        } else if (cell.number == -2) {
          cell.wall = true;
          cell.number = null;
        } else {
          cell.wall = true;
        }
      }
    }

    click(x, y) {
      const cell = this.get(x, y, true);

      if (cell.wall) {
        return;
      }
      const change = {};

      if (cell.light) {
        change.light = false;
        change.none = true;
      } else if (cell.none) {
        change.none = false;
      } else {
        change.light = true;
      }

      this.set(x, y, change, true);
    }
  }

  class Cell extends BaseCell {
    constructor(...args) {
      super(...args);
      this.dlight = 0;
      this.bright = 0;
    }

    images() {
      const images = [];
      if (this.wall) {
        if (this.number == null) {
          images.push({
            src: "mode/akari/img/wall.png"
          });
        } else {
          images.push({
            src: `mode/akari/img/wall${this.number}.png`
          });

          const arounds = this.arounds();
          if (arounds.filled) {
            if (arounds.light == this.number) {
              images.push({
                src: "mode/akari/img/ruleok.png"
              });
            } else {
              images.push({
                src: "mode/akari/img/ruleng.png"
              });
            }
          } else if (arounds.light > this.number) {
            images.push({
              src: "mode/akari/img/ruleng.png"
            });
          }
        }
      } else {
        images.push({
          src: "mode/akari/img/floor.png"
        });
        if (this.bright >= 1) {
          images.push({
            src: "mode/akari/img/bright.png"
          });
        }
        if (this.light) {
          images.push({
            src: "mode/akari/img/light.png"
          });
          if (this.bright >= 2) {
            images.push({
              src: "mode/akari/img/ruleng.png"
            });
          }
        }
        if (this.none) {
          images.push({
            src: "mode/akari/img/none.png"
          });
        }
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
        const cell = this.board.get(this.x + around[0], this.y + around[1]);
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
      let x = this.x + addx;
      let y = this.y + addy;
      while (true) {
        const cell = this.board.get(x, y);
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
