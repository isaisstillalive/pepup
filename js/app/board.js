define(function(require) {
  const History = require("app/history");
  const Transcoder = require("app/transcoder");

  class Board {
    constructor(width, height, source, cell, room) {
      this.width = width;
      this.height = height;
      this.strict = false;

      this.wall = new cell(this, -1, -1);
      this.wall.wall = true;
      const transcoder = new Transcoder(
        this,
        source,
        width,
        height,
        cell,
        room
      );
      this.decode(transcoder);

      this.history = new History(this);

      this.judgment = null;
    }

    decode(transcoder) {}

    get(x, y) {
      if (this.width <= x || x < 0) {
        return this.wall;
      }
      return this.cells[x + y * this.width] || this.wall;
    }
    set(x, y, change, rec = false) {
      if (rec) {
        change = this.history.record(x, y, change);
      }
      const index = x + y * this.width;
      Object.assign(this.cells[index], change);
      Vue.set(this.cells, index, this.cells[index]);
      this.resetjudgment();
    }

    refresh() {
      for (const cell of this.cells) {
        cell.refresh();
      }
      for (const cell of this.cells) {
        cell.corrected;
      }
    }

    judge() {
      this.strict = true;

      this.refresh();
      const judgment =
        this.cells.every(cell => cell.corrected) &&
        this.rooms.every(room => room.correction());
      Vue.set(this, "judgment", judgment);
    }
    resetjudgment() {
      this.strict = false;
      this.judgment = null;
      this.refresh();
    }

    *recursion(x, y, checked) {
      const i = x + y * this.height;
      if (checked == undefined) {
        checked = new Array(this.width * this.height);
      } else if (checked[i]) {
        return;
      }
      const dirs = yield this.get(x, y);
      checked[i] = true;

      if (!dirs) {
        return;
      }

      const arounds = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ].filter((val, index) => dirs[index]);
      for (const around of arounds) {
        const nx = x + around[0];
        const ny = y + around[1];
        if (nx == -1 || nx == this.width || ny == -1 || ny == this.height) {
          continue;
        }
        yield* this.recursion(nx, ny, checked);
      }
    }

    *around(x, y) {
      const arounds = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      for (const around of arounds) {
        const nx = x + around[0];
        const ny = y + around[1];
        yield this.get(nx, ny);
      }
    }

    checkFragment(divideMark = true) {
      // 塗られていない最大サイズを求める
      const range = [this.width - 1, 0, this.height - 1, 0];
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.get(x, y).marked !== divideMark) {
            range[0] = Math.min(range[0], x);
            range[1] = Math.max(range[1], x);
            range[2] = Math.min(range[2], y);
            range[3] = Math.max(range[3], y);
          }
        }
      }

      // 最大サイズの四辺まで繋がっていれば有効なシマ
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.get(x, y)._fragment === null) {
            this.checkFragmentCell(x, y, range, divideMark);
          }
        }
      }
    }

    checkFragmentCell(x, y, range, divideMark) {
      const borders = [false, false, false, false];
      const on = [true, true, true, true];

      const cells = [];

      const it = this.recursion(x, y);
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
        if (cell.x == range[1]) {
          borders[1] = true;
        }
        if (cell.y == range[2]) {
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

  return Board;
});
