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
          change.triangle = undefined;
          change.none = true;
          return true;
        }
      } else {
        let triangle = Math.floor(((position.angle + 1) % 2) / 0.5);
        if (this.triangle != triangle) {
          change.triangle = triangle;
          change.none = false;
          return false;
        }
      }

      change.triangle = undefined;
      change.none = false;
      return true;
    }

    images() {
      const images = [];

      if (this.wall) {
        images.push("wall");
        if (this.number != null) {
          images.push(`number${this.number}w`);
        }

        let correction = this.correction();
        if (this.board.strict) {
          correction = !!correction;
        }
        if (correction === false) {
          images.push("ng");
        } else if (correction === true) {
          images.push("ok");
        }
        return images;
      }

      images.push("floor");

      if (this.bright >= 1) {
        images.push("bright");
      }

      if (this.triangle >= 0) {
        images.push(`paint${this.triangle}`);
      } else if (this.none) {
        images.push("none");
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

    arounds() {
      let result = {
        triangle: 0,
        filled: 0
      };

      for (const cell of this.board.around(this.x, this.y)) {
        if (cell.wall || cell.none) {
          result.filled += 1;
        } else if (cell.triangle !== undefined) {
          result.filled += 1;
          result.triangle += 1;
        }
      }

      result.filled = this.board.strict || result.filled == 4;

      return result;
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

    correction() {
      // 壁の場合、周囲がすべて埋まり番号と一致していればOK
      // 番号を超えていたらNG
      if (this.wall) {
        if (this.number == null) {
          return true;
        }
        const arounds = this.arounds();
        if (arounds.filled) {
          if (arounds.triangle == this.number) {
            return true;
          } else {
            return false;
          }
        } else if (arounds.triangle > this.number) {
          return false;
        }
        return null;
      }

      // 隣と斜めが合ってるか確認する
      if (this.triangle !== undefined) {
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
            [[0, -1], 0, [-1, -1]],
            [[1, 0], 2, [1, 1]]
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
      }

      return null;
    }

    get undecided() {
      return !this.board.strict && !this.none && this.triangle === undefined;
    }

    get open() {
      return !this.wall && (this.none || this.triangle === undefined);
    }

    get left() {
      return this.triangle === 3 || this.triangle === 0;
    }
    get top() {
      return this.triangle === 0 || this.triangle === 1;
    }
    get right() {
      return this.triangle === 1 || this.triangle === 2;
    }
    get bottom() {
      return this.triangle === 2 || this.triangle === 3;
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
