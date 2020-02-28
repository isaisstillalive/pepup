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
        src: "img/cell/floor.png",
        class: "bg"
      });
      if (this.circle === true) {
        images.push({
          src: "mode/mashu/img/white.png",
          class: "bg"
        });
        if (this.whiteng) {
          images.push({
            src: "img/cell/ruleng.png"
          });
        }
      } else if (this.circle === false) {
        images.push({
          src: "mode/mashu/img/black.png",
          class: "bg"
        });
        if (this.blackng) {
          images.push({
            src: "img/cell/ruleng.png"
          });
        }
      } else {
        if (this.lines >= 3) {
          images.push({
            src: "img/cell/ruleng.png"
          });
        }
      }
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

    get lines() {
      let line = 0;
      ["right", "bottom", "left", "top"].forEach(dir => {
        if (this[dir] == 1) {
          line += 1;
        }
      });
      return line;
    }
    get horizontal() {
      return this.right == 1 || this.left == 1;
    }
    get vertical() {
      return this.top == 1 || this.bottom == 1;
    }

    get whiteng() {
      if (this.horizontal && this.vertical) {
        return true;
      }
      if (this.left == 1 && this.right == 1) {
        if (this.cell(-1, 0).left == 1 && this.cell(1, 0).right == 1) {
          return true;
        }
      }
      if (this.top == 1 && this.bottom == 1) {
        if (this.cell(0, -1).top == 1 && this.cell(0, 1).bottom == 1) {
          return true;
        }
      }
    }

    get blackng() {
      if (
        (this.top == 1 && this.bottom == 1) ||
        (this.right == 1 && this.left == 1)
      ) {
        return true;
      }
      if (this.left == 1 && this.cell(-1, 0).vertical) {
        return true;
      }
      if (this.right == 1 && this.cell(1, 0).vertical) {
        return true;
      }
      if (this.top == 1 && this.cell(0, -1).horizontal) {
        return true;
      }
      if (this.bottom == 1 && this.cell(0, 1).horizontal) {
        return true;
      }
    }

    set qnum(value) {
      if (value >= 1) {
        this.circle = value == 1;
      }
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
