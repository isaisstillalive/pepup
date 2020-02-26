define(function() {
  class Board extends BaseBoard {
    decode(source) {
      this.decode4Cell(source);
      for (let c = 0; c < this.data.length; c++) {
        const cell = this.data[c];
        if (cell.number == -1) {
          cell.wall = false;
          cell.light = false;
          cell.none = false;
          cell.bright = 0;
        } else if (cell.number == -2) {
          cell.wall = true;
          cell.number = null;
        } else {
          cell.wall = true;
        }
      }
    }

    changed(x, y, change) {
      if (change.light !== undefined) {
        this.ray(x, y, change.light);
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

    ray(x, y, value) {
      this.setBrights(x - 1, y, 1, 0, value);
      this.setBrights(x, y, -1, 0, value);
      this.setBrights(x, y, 0, 1, value);
      this.setBrights(x, y, 0, -1, value);
    }

    setBrights(basex, basey, addx, addy, value) {
      let x = basex + addx;
      let y = basey + addy;
      while (true) {
        const cell = this.get(x, y);
        if (cell == undefined || cell.wall) {
          break;
        }
        cell.bright += value ? 1 : -1;
        x += addx;
        y += addy;
      }
    }

    arounds(x, y) {
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
        const cell = this.get(x + around[0], y + around[1]);
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
  }

  class Cell extends BaseCell {
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

          const arounds = this.board.arounds(this.x, this.y);
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
  }

  return {
    board: Board,
    cell: Cell
  };
});
