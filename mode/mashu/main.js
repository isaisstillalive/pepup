define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeCircle();
    }
  }

  const cell = require("app/cell");
  const line = require("app/cell/mark/line");

  class Cell extends cell.mixin(line) {
    images(images) {
      this.imagesLine(images);

      images.push("floor");

      if (this.circle === true) {
        images.push("wcircle");
      } else if (this.circle === false) {
        images.push("bcircle");
      }
    }

    set qnum(value) {
      if (value >= 1) {
        this.circle = value == 1;
      }
    }

    evaluate() {
      const loop = this.singleLoop;

      // 白丸なら
      if (this.circle === true) {
        return this.correctionWhite();
      } else if (this.circle === false) {
        return this.correctionBlack();
      }

      if (this.junction == 0) {
        return true;
      }

      if (loop) {
        return true;
      }

      return null;
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
  }

  return {
    board: Board,
    cell: Cell
  };
});
