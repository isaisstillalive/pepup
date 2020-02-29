define(function(require) {
  const History = require("app/history");
  const Transcoder = require("app/transcoder");

  class Board {
    constructor(width, height, source, cell) {
      this.width = width;
      this.height = height;

      this.cells = new Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = x + y * width;
          this.cells[i] = new cell(this, x, y);
        }
      }

      const transcoder = new Transcoder(source, this.cells);
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
  }

  return Board;
});
