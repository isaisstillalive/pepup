define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeCircle();
    }
  }

  class Cell extends require("app/cell") {
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

    images(images) {
      images.push({
        src: "img/cell/floor.png",
        class: "bg"
      });

      if (this.circle === true) {
        images.push({
          src: "mode/mashu/img/white.png",
          class: "bg"
        });
      } else if (this.circle === false) {
        images.push({
          src: "mode/mashu/img/black.png",
          class: "bg"
        });
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

      this.correctionimages(images);
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

    set qnum(value) {
      if (value >= 1) {
        this.circle = value == 1;
      }
      this.right = 0;
      this.bottom = 0;
    }

    correction() {
      // 白丸なら
      if (this.circle === true) {
        return this.correctionWhite();
      } else if (this.circle === false) {
        return this.correctionBlack();
      }

      const lines = this.lines;
      if (lines == 1) {
        return null;
      } else if (lines == 0 || lines == 2) {
        return true;
      } else {
        return false;
      }
    }
    correctionWhite() {
      // 曲がっていればNG
      if (this.horizontal && this.vertical) {
        return false;
      }
      // 隣のセルが両方直進していればNG
      // どちらかが曲がっていればOK
      const arounds = this.arounds();
      if (arounds.straight == 2) {
        return false;
      } else if (arounds.turn >= 1) {
        return true;
      }
      return null;
    }

    correctionBlack() {
      // 直線ならNG
      if (
        (this.top == 1 && this.bottom == 1) ||
        (this.right == 1 && this.left == 1)
      ) {
        return false;
      }

      // 隣のセルが両方直進していればOK
      // どちらかが曲がっていればNG
      const arounds = this.arounds();
      if (arounds.turn >= 1) {
        return false;
      } else if (arounds.straight == 2) {
        return true;
      }
      return null;
    }

    arounds() {
      let result = {
        straight: 0,
        turn: 0
      };

      const arounds = [
        ["left", [-1, 0], "vertical"],
        ["right", [1, 0], "vertical"],
        ["top", [0, -1], "horizontal"],
        ["bottom", [0, 1], "horizontal"]
      ];
      for (const around of arounds) {
        if (this[around[0]] == 1) {
          const cell = this.cell(...around[1]);
          if (cell[around[0]] == 1) {
            result.straight += 1;
          }
          if (cell[around[2]]) {
            result.turn += 1;
          }
        }
      }

      return result;
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
