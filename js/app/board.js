define(function(require) {
  const History = require("app/history");
  const Transcoder = require("app/transcoder");

  class Board {
    constructor(width, height, source, cell) {
      this.width = width;
      this.height = height;

      const transcoder = new Transcoder(
        source,
        width,
        height,
        (x, y) => new cell(this, x, y)
      );
      this.decode(transcoder);
      this.cells = transcoder.cells;
      this.rooms = transcoder.rooms;

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
  }

  return Board;
});
