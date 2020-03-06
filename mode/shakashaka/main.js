define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    touch(position, change) {
      if (position.distance <= 0.3) {
        if (!this.none) {
          change.mark = false;
          return true;
        }
      } else {
        let triangle = Math.floor(((position.angle + 1) % 2) / 0.5);
        if (this.triangle != triangle) {
          change.mark = true;
          change.triangle = triangle;
          return false;
        }
      }

      change.mark = null;
      return true;
    }

    images(images) {
      if (this.wallimages(images)) {
        return true;
      }

      images.push("floor");

      if (this.bright >= 1) {
        images.push("bright");
      }

      if (this.mark === true) {
        images.push(`paint${this.triangle}`);
      } else if (this.mark === false) {
        images.push("none");
      }
    }

    correction() {
      const wall = this.correctionWall();
      if (wall !== null) {
        return wall;
      }

      // 塗りの場合
      if (this.marked === true) {
        // 対角が空か対以外ならNG
        if (this.paintDiagonalsCorrection() === false) {
          return false;
        }

        // 塗りが線か角が繋がっていればOK
        const correction = this.paintConnectionCorrection();
        if (correction !== null) {
          return correction;
        }
      } else if (this.marked === false) {
        if (this.openCorrection() === false) {
          return false;
        }
      }

      return null;
    }

    paintDiagonalsCorrection() {
      const diagonals = [
        [1, 1],
        [-1, 1],
        [-1, -1],
        [1, -1]
      ];
      const cell = this.cell(...diagonals[this.triangle]);
      if (
        cell.wall ||
        (!cell.open && cell.triangle != (this.triangle + 2) % 4)
      ) {
        return false;
      }
    }

    paintConnectionCorrection() {
      // 隣と斜めが合ってるか確認する
      // 左上のとき、右が右上ならOK
      // 右が未決定なら未決定
      // 右が空なら、右上が左上ならOK、未定以外ならNG
      // 右がそれ以外ならNG
      const arounds = [
        [
          [[1, 0], 1, [1, -1]],
          [[0, 1], 3, [-1, 1]]
        ],
        [
          [[-1, 0], 0, [-1, -1]],
          [[0, 1], 2, [1, 1]]
        ],
        [
          [[-1, 0], 3, [-1, 1]],
          [[0, -1], 1, [1, -1]]
        ],
        [
          [[1, 0], 2, [1, 1]],
          [[0, -1], 0, [-1, -1]]
        ]
      ];
      let cell;
      let result = true;
      for (const around of arounds[this.triangle]) {
        cell = this.cell(...around[0]);
        if (cell.wall) {
          return false;
        } else if (cell.triangle === around[1]) {
          result = result && true;
        } else if (cell.undecided) {
        } else if (cell.open) {
          cell = this.cell(...around[2]);
          if (cell.wall) {
            return false;
          } else if (cell.triangle == this.triangle) {
            result = result && true;
          } else if (!cell.undecided) {
            return false;
          }
        } else {
          return false;
        }
      }
      if (result) {
        return true;
      }

      return null;
    }

    openCorrection() {
      const arounds = [
        [-1, 0],
        [0, -1],
        [1, 0],
        [0, 1]
      ];
      const opens = [false, false, false, false, false];

      // 四方の空きを確認
      let index = 0;
      for (const around of arounds) {
        const cell = this.cell(...around);
        opens[index] = !cell.wall && cell.jnone;
        index += 1;
      }
      opens[4] = opens[0];

      // 左と上が空いている場合、左上も空いていなければNG
      const diagonals = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1]
      ];
      index = 0;
      for (const diagonal of diagonals) {
        if (opens[index] && opens[index + 1]) {
          const cell = this.cell(...diagonal);
          if (!cell.open && cell.triangle != index) {
            return false;
          }
        }
        index += 1;
      }

      return null;
    }

    get jnone() {
      return this.none || (this.board.strict && this.triangle === undefined);
    }

    get undecided() {
      return !this.board.strict && !this.none && this.triangle === undefined;
    }

    get open() {
      return !this.wall && (this.none || this.triangle === undefined);
    }

    get left() {
      return this.wall || this.triangle === 3 || this.triangle === 0;
    }
    get top() {
      return this.wall || this.triangle === 0 || this.triangle === 1;
    }
    get right() {
      return this.wall || this.triangle === 1 || this.triangle === 2;
    }
    get bottom() {
      return this.wall || this.triangle === 2 || this.triangle === 3;
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.wall = false;
          this.triangle = undefined;
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
