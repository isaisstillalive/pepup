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
        const range = [this.board.width - 1, this.board.height - 1, 0, 0];
        for (const cell of this.board.cells) {
          if (cell.marked == divideMark) {
            continue;
          }
          range[0] = Math.min(range[0], cell.x);
          range[1] = Math.min(range[1], cell.y);
          range[2] = Math.max(range[2], cell.x);
          range[3] = Math.max(range[3], cell.y);
        }

        // 最大サイズの四辺まで繋がっていれば有効なシマ
        for (const cell of this.board.cells) {
          this.checkFragment(range);
        }
      }

      checkFragment(range) {
        if (this._fragment !== null) {
          return;
        }

        const borders = [false, false, false, false];
        const cells = [];

        for (const { cell, dirs } of this.board.recursion(this.x, this.y)) {
          if (cell.marked === divideMark) {
            continue;
          }
          cells.push(cell);

          const pos = [cell.x, cell.y, cell.x, cell.y];
          for (let i = 0; i < 4; i++) {
            borders[i] = borders[i] || (pos[i] == range[i]);
          }

          dirs.fill(true, 0, 4);
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
