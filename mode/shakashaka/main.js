define(function() {
  class Board extends BaseBoard {
    initialize(data) {
      const map = [
        [9, 5, 9, 9, 9, 1, 9, 1, 9, 9],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
        [9, 9, 9, 2, 9, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 9, 9, 2, 9, 9],
        [9, 9, 1, 9, 9, 9, 9, 9, 9, 2],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 1, 9, 9, 9, 9],
        [1, 9, 9, 9, 9, 9, 9, 9, 5, 9],
        [9, 9, 9, 9, 9, 9, 2, 9, 9, 9],
        [9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
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
              triangle: 0,
              none: false,
            };
          }
          this.data[x + y * width] = cell;
        }
      }
    }

    click(x, y, touch) {
      const cell = this.get(x, y, true);

      if (cell.type != "floor") {
        return;
      }
      const change = {};

      const margin = 0.3;
      change.triangle = 0;
      if (touch.y < margin) {
        if (touch.x < margin) {
          change.triangle = 1;
        } else if (touch.x >= (1-margin)) {
          change.triangle = 2;
        }
      } else if (touch.y >= (1-margin)) {
        if (touch.x < margin) {
          change.triangle = 4;
        } else if (touch.x >= (1-margin)) {
          change.triangle = 3;
        }
      }
      if (change.triangle == 0) {
        change.none = (cell.triangle == 0) && !cell.none;
      } else {
        change.none = false;
      }

      this.set(x, y, change, true);
    }

    arounds(x, y) {
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
        const cell = this.get(x + around[0], y + around[1]);
        if (cell == undefined || cell.type == "wall" || cell.none) {
          result.filled += 1;
        } else if (cell.triangle >= 1) {
          result.filled += 1;
          result.triangle += 1;
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
          if (current == undefined) {
            return;
          }

          const images = [];
          if (current.type == "wall") {
            if (current.number == null) {
              images.push({
                src: "mode/shakashaka/img/wall.png"
              });
            } else {
              images.push({
                src: `mode/shakashaka/img/wall${current.number}.png`
              });

              const arounds = this.board.arounds(this.x, this.y);
              if (arounds.filled) {
                if (arounds.triangle == current.number) {
                  images.push({
                    src: "mode/shakashaka/img/ruleok.png"
                  });
                } else {
                  images.push({
                    src: "mode/shakashaka/img/ruleng.png"
                  });
                }
              } else if (arounds.triangle > current.number) {
                images.push({
                  src: "mode/shakashaka/img/ruleng.png"
                });
              }
            }
          } else if (current.type == "floor") {
            images.push({
              src: "mode/shakashaka/img/floor.png"
            });
            if (current.triangle >= 1) {
              images.push({
                src: `mode/shakashaka/img/triangle${current.triangle}.png`
              });
            }
            if (current.none) {
              images.push({
                src: "mode/shakashaka/img/none.png"
              });
            }
          }
          return images;
        }
      }
    }
  };
});
