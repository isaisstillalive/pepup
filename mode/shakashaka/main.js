define(function() {
  class Board extends BaseBoard {
    decode(source) {
      this.decode4Cell(source);
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
        change.triangle = 0;
        change.none = this.triangle == 0 && !this.none;
      } else {
        let triangle = 0;
        if (y < 0.5) {
          if (x < 0.5) {
            triangle = 1;
          } else {
            triangle = 2;
          }
        } else {
          if (x < 0.5) {
            triangle = 4;
          } else {
            triangle = 3;
          }
        }
        change.triangle = this.triangle == triangle ? 0 : triangle;
        change.none = false;
      }

      this.update(change);
    }

    images() {
      const images = [];
      if (this.wall) {
        if (this.number == null) {
          images.push({
            src: "mode/shakashaka/img/wall.png"
          });
        } else {
          images.push({
            src: `mode/shakashaka/img/wall${this.number}.png`
          });

          const arounds = this.arounds();
          if (arounds.filled) {
            if (arounds.triangle == this.number) {
              images.push({
                src: "mode/shakashaka/img/ruleok.png"
              });
            } else {
              images.push({
                src: "mode/shakashaka/img/ruleng.png"
              });
            }
          } else if (arounds.triangle > this.number) {
            images.push({
              src: "mode/shakashaka/img/ruleng.png"
            });
          }
        }
      } else {
        images.push({
          src: "mode/shakashaka/img/floor.png"
        });
        if (this.triangle >= 1) {
          images.push({
            src: `mode/shakashaka/img/triangle${this.triangle}.png`
          });
        }
        if (this.none) {
          images.push({
            src: "mode/shakashaka/img/none.png"
          });
        }
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
        const cell = this.cell(this.x + around[0], this.y + around[1]);
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

    set qnum(value) {
      switch (value) {
        case -1:
          this.wall = false;
          this.triangle = 0;
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
  }

  return {
    board: Board,
    cell: Cell
  };
});
