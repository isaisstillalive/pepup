define(function() {
  class Board extends BaseBoard {
    initialize(data) {
      const map = [
        [9, 9, 0, 5, 5, 5, 0, 9, 9, 9],
        [9, 9, 9, 9, 1, 9, 9, 9, 9, 9],
        [5, 9, 9, 9, 1, 9, 9, 9, 9, 9],
        [5, 9, 0, 5, 5, 5, 0, 9, 9, 0],
        [5, 9, 9, 9, 1, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 1, 9, 9, 9, 9, 9],
        [9, 9, 0, 5, 5, 5, 0, 9, 9, 1],
        [5, 9, 9, 5, 9, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 9, 1, 9, 9, 1],
        [1, 9, 9, 5, 5, 5, 5, 5, 9, 9],
        [9, 9, 9, 9, 9, 1, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 1, 9, 9, 9, 5],
        [1, 9, 9, 0, 5, 5, 5, 2, 9, 5],
        [9, 9, 9, 9, 9, 1, 9, 9, 9, 5],
        [9, 9, 9, 9, 9, 1, 9, 9, 9, 9],
        [9, 9, 9, 0, 5, 5, 5, 0, 9, 9]
      ];

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          let cell;
          const element = map[y][x];
          if (element >= 0 && element <= 4) {
            cell = {
              type: "wall",
              number: element
            };
          } else if (element == 5) {
            cell = {
              type: "wall",
              number: null
            };
          } else {
            cell = {
              type: "floor",
              light: false,
              none: false,
              bright: 0
            };
          }
          this.data[x + y * width] = cell;
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

      if (cell.type != "floor") {
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
        if (cell == undefined || cell.type == "wall") {
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
        if (cell == undefined || cell.type == "wall" || cell.none) {
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

  return {
    board: Board,
    cell: {
      computed: {
        images() {
          const current = this.current;

          const images = [];
          if (current.type == "wall") {
            if (current.number == null) {
              images.push({
                src: "mode/akari/img/wall.png"
              });
            } else {
              images.push({
                src: `mode/akari/img/wall${current.number}.png`
              });

              const arounds = this.board.arounds(this.x, this.y);
              if (arounds.filled) {
                if (arounds.light == current.number) {
                  images.push({
                    src: "mode/akari/img/ruleok.png"
                  });
                } else {
                  images.push({
                    src: "mode/akari/img/ruleng.png"
                  });
                }
              } else if (arounds.light > current.number) {
                images.push({
                  src: "mode/akari/img/ruleng.png"
                });
              }
            }
          } else if (current.type == "floor") {
            images.push({
              src: "mode/akari/img/floor.png"
            });
            if (current.bright >= 1) {
              images.push({
                src: "mode/akari/img/bright.png"
              });
            }
            if (current.light) {
              images.push({
                src: "mode/akari/img/light.png"
              });
              if (current.bright >= 2) {
                images.push({
                  src: "mode/akari/img/ruleng.png"
                });
              }
            }
            if (current.none) {
              images.push({
                src: "mode/akari/img/none.png"
              });
            }
            if (current.pin !== undefined) {
              images.push({
                src: `img/pin${current.pin}.png`
              });
            }
          }
          return images;
        }
      }
    }
  };
});
