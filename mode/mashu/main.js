define(function() {
  class Board extends BaseBoard {
    decode(source) {
      this.decodeCircle(source);
    }
  }

  class Cell extends BaseCell {
    click(x, y) {
      let cell;
      let property;
      const change = {};

      // 左と上は隣のセル
      if (y <= 1 - x) {
        if (y <= 0.5 - Math.abs(0.5 - x)) {
          if (this.y == 0) {
            return;
          }
          cell = this.cell(0, -1);
          property = "bottom";
        } else {
          if (this.x == 0) {
            return;
          }
          cell = this.cell(-1, 0);
          property = "right";
        }
      } else {
        cell = this;
        if (y <= x) {
          if (this.x == this.board.width - 1) {
            return;
          }
          property = "right";
        } else {
          if (this.y == this.board.height - 1) {
            return;
          }
          property = "bottom";
        }
      }

      change[property] = (cell[property] + 1) % 3;
      cell.update(change);
    }

    images() {
      const images = [];
      images.push({
        src: `mode/mashu/img/floor${this.number}.png`
      });
      if (this.x > 0) {
        const cell = this.cell(-1, 0);
        if (cell.right >= 1) {
          images.push({
            src: `mode/mashu/img/left${cell.right}.png`
          });
        }
      }
      if (this.y > 0) {
        const cell = this.cell(0, -1);
        if (cell.bottom >= 1) {
          images.push({
            src: `mode/mashu/img/top${cell.bottom}.png`
          });
        }
      }
      if (this.right >= 1) {
        images.push({
          src: `mode/mashu/img/right${this.right}.png`
        });
      }
      if (this.bottom >= 1) {
        images.push({
          src: `mode/mashu/img/bottom${this.bottom}.png`
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
        const cell = this.board.get(this.x + around[0], this.y + around[1]);
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
      this.number = value;
      this.right = 0;
      this.bottom = 0;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
