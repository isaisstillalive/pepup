define(function(require) {
  const History = require("app/history");
  const Transcoder = require("app/transcoder");

  class Board {
    constructor(width, height, source, cell, room) {
      this.width = width;
      this.height = height;

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
    }

    decode(transcoder) {}

    get(x, y) {
      if (this.width <= x || x < 0) {
        return { wall: true };
      }
      return this.cells[x + y * this.width] || { wall: true };
    }
    set(x, y, change, rec = false) {
      if (rec) {
        this.history.record(x, y, change);
      }
      const index = x + y * this.width;
      Object.assign(this.cells[index], change);
      Vue.set(this.cells, index, this.cells[index]);
    }

    judgment() {
      return this.cells.every(cell => cell.correction());
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
  }

  return Board;
});
