define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeCircle();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change, mark) {
      if (position.distance <= 0.4) {
        mark.line = undefined;
        return true;
      }

      let property;
      if (position.angle <= -0.75 || position.angle > 0.75) {
        property = "left";
      } else if (position.angle <= -0.25) {
        property = "top";
      } else if (position.angle <= 0.25) {
        property = "right";
      } else {
        property = "bottom";
      }
      change[property] = this[property] == 2 ? 0 : 2;
      return false;
    }

    enter(x, y, change, mark) {
      let property;
      if (x <= -1) {
        property = "left";
      } else if (y <= -1) {
        property = "top";
      } else if (x >= 1) {
        property = "right";
      } else {
        property = "bottom";
      }
      if (mark.line === undefined) {
        mark.line = this[property] == 0 ? 1 : 0;
      }
      change[property] = mark.line;
      return true;
    }

    images() {
      const images = [];

      images.push("floor");

      if (this.circle === true) {
        images.push("wcircle");
      } else if (this.circle === false) {
        images.push("bcircle");
      }
      if (this.left == 1) {
        images.push("lline");
      } else if (this.left == 2) {
        images.push("lnone");
      }
      if (this.top == 1) {
        images.push("tline");
      } else if (this.top == 2) {
        images.push("tnone");
      }

      let correction = this.correction();
      if (this.board.strict) {
        correction = !!correction;
      }
      if (correction === false) {
        images.push("ng");
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

    set right(value) {
      if (this.x < this.board.width - 1) {
        this.cell(1, 0).left = value;
      }
    }
    get right() {
      if (this.x < this.board.width - 1) {
        return this.cell(1, 0).left;
      }
      return 0;
    }

    set bottom(value) {
      if (this.y < this.board.height - 1) {
        this.cell(0, 1).top = value;
      }
    }
    get bottom() {
      if (this.y < this.board.height - 1) {
        return this.cell(0, 1).top;
      }
      return 0;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
