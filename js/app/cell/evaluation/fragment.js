define(function(require) {
  return (cell, divideMark = 1) => {
    class Module extends cell {
      refresh() {
        super.refresh();
        this._fragment = null;
      }

      get fragment() {
        if (this._fragment === null) {
          this.checkFragmentAll();
        }
        return this._fragment;
      }

      checkFragmentAll() {
        // 塗られていない最大サイズを求める
        const range = [this.board.width - 1, 0, this.board.height - 1, 0];
        for (let y = 0; y < this.board.height; y++) {
          for (let x = 0; x < this.board.width; x++) {
            if (this.board.get(x, y).marked !== divideMark) {
              range[0] = Math.min(range[0], x);
              range[1] = Math.min(range[1], y);
              range[2] = Math.max(range[2], x);
              range[3] = Math.max(range[3], y);
            }
          }
        }

        // 最大サイズの四辺まで繋がっていれば有効なシマ
        for (let y = 0; y < this.board.height; y++) {
          for (let x = 0; x < this.board.width; x++) {
            if (this.board.get(x, y)._fragment === null) {
              this.checkFragment(range);
            }
          }
        }
      }

      checkFragment(range) {
        const borders = [false, false, false, false];
        const on = [true, true, true, true];

        const cells = [];

        const it = this.board.recursion(this.x, this.y);
        let result = it.next();
        while (!result.done) {
          const cell = result.value;
          if (cell.marked === divideMark) {
            result = it.next();
            continue;
          }
          cells.push(cell);

          if (cell.x == range[0]) {
            borders[0] = true;
          }
          if (cell.y == range[1]) {
            borders[1] = true;
          }
          if (cell.x == range[2]) {
            borders[2] = true;
          }
          if (cell.y == range[3]) {
            borders[3] = true;
          }

          result = it.next(on);
        }

        const fragment = borders.some(value => !value);
        for (const cell of cells) {
          cell._fragment = fragment;
        }
      }
    }
    return Module;
  };
});
