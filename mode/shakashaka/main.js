define(function() {
  class Board extends BaseBoard {
    decode(data) {
      this.decode4Cell(source);
      for (let c = 0; c < this.data.length; c++) {
        const cell = this.data[c];
        if (cell.number == -1) {
          cell.wall = false;
          cell.triangle = 0;
          cell.none = false;
        } else if (cell.number == -2) {
          cell.wall = true;
          cell.number = null;
        } else {
          cell.wall = true;
        }
      }
    }

    click(x, y, touch) {
      const cell = this.get(x, y, true);

      if (cell.wall) {
        return;
      }

      const change = {};

      const dist = Math.sqrt((touch.x - 0.5) ** 2 + (touch.y - 0.5) ** 2);
      if (dist <= 0.25) {
        change.triangle = 0;
        change.none = cell.triangle == 0 && !cell.none;
      } else {
        let triangle = 0;
        if (touch.y < 0.5) {
          if (touch.x < 0.5) {
            triangle = 1;
          } else {
            triangle = 2;
          }
        } else {
          if (touch.x < 0.5) {
            triangle = 4;
          } else {
            triangle = 3;
          }
        }
        change.triangle = cell.triangle == triangle ? 0 : triangle;
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
        if (cell == undefined || cell.wall || cell.none) {
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
          if (current.wall) {
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
          } else {
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
