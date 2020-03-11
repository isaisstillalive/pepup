define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decodeNumber16();
    }
  }

  const cell = require("app/cell");
  const fragment = require("app/cell/evaluation/fragment");
  const cluster = require("app/cell/evaluation/cluster");

  class Cell extends cell.mixin(fragment, [cluster, [true, false]]) {
    constructor(...args) {
      super(...args);
      this.strictDefaultMark = true;
    }

    touch(position, change) {
      if (this.circle || position.y <= 0) {
        if (this.mark !== false) {
          change.mark = false;
          return true;
        }
      } else {
        if (this.mark !== true) {
          change.mark = true;
          return true;
        }
      }

      change.mark = null;
      return true;
    }

    images(images) {
      if (this.mark === true) {
        images.push("black");
      } else if (this.mark === false) {
        images.push("white");
      } else {
        images.push("floor");
      }

      if (this.circle) {
        images.push("circle");
        if (this.number > 0) {
          images.push("number");
        }
      }
    }

    evaluate() {
      // 4つ固まっていたらNG
      if (this.cluster) {
        return false;
      }

      // 塗りなら丸はNG、丸でなければOK
      if (this.marked === true) {
        return !this.circle;
      }

      // シマが分断されていればNG
      if (this.fragment) {
        return false;
      }

      // 非数字丸の場合、岬ならOK
      // 数字丸なら、岬で白マス数が正しければOK
      // 絶対に白マス数が足りなければNG
      // それ以外なら未決定
      const cape = this.isCape();
      if (this.circle) {
        if (this.number == null) {
          return cape;
        }
        if (cape === false) {
          return false;
        }

        let whites = [];
        const arounds = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1]
        ];
        for (const around of arounds) {
          whites.push(this.countwhite(...around));
        }
        const length = Math.max(...whites);
        if (this.number > length) {
          return false;
        } else if (this.number == length && cape === true) {
          return true;
        }
        return null;
      }

      // 丸ではないので岬はNG
      if (cape === true) {
        return false;
      }

      return true;
    }

    countwhite(addx, addy) {
      for (let count = 0; true; count++) {
        if (!this.cell(addx * count, addy * count).open) {
          return count;
        }
      }
    }

    get open() {
      return !this.wall && this.marked !== true;
    }

    isCape() {
      const aroundMarks = this.aroundMarks();
      if (aroundMarks.filled) {
        if (aroundMarks.opens == 1) {
          return true;
        } else {
          return false;
        }
      }

      return null;
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.circle = false;
          this.none = false;
          break;

        case -2:
          this.circle = true;
          this.none = false;
          break;

        default:
          this.circle = true;
          this.none = false;
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
