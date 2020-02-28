define(function() {
  class Board extends BaseBoard {
    decode(source) {
      this.decodeCircle(source);
    }
  }

  class Cell extends BaseCell {
    click(x, y) {
      let property;
      const change = {};

      if (y <= 1 - x) {
        if (y <= 0.5 - Math.abs(0.5 - x)) {
          if (this.y == 0) {
            return;
          }
          property = "top";
        } else {
          if (this.x == 0) {
            return;
          }
          property = "left";
        }
      } else {
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

      change[property] = (this[property] + 1) % 3;
      this.update(change);
    }

    images() {
      const images = [];
      images.push({
        src: `mode/mashu/img/floor${this.number}.png`,
        class: "bg"
      });
      if (this.right >= 1) {
        images.push({
          src: `mode/mashu/img/right${this.right}.png`,
          class: "link"
        });
      }
      if (this.bottom >= 1) {
        images.push({
          src: `mode/mashu/img/bottom${this.bottom}.png`,
          class: "link"
        });
      }
      return images;
    }

    set qnum(value) {
      this.number = value;
      this.right = 0;
      this.bottom = 0;
    }

    set left(value) {
      if (this.x > 0) {
        this.cell(-1, 0).right = value;
      }
    }
    get left() {
      if (this.x > 0) {
        return this.cell(-1, 0).right;
      }
      return 0;
    }

    set top(value) {
      if (this.y > 0) {
        this.cell(0, -1).bottom = value;
      }
    }
    get top() {
      if (this.y > 0) {
        return this.cell(0, -1).bottom;
      }
      return 0;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
