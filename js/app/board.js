define(function(require) {
  const History = require("app/history");
  const Transcoder = require("app/transcoder");

  class Board {
    constructor(width, height, source, cell) {
      this.width = width;
      this.height = height;

      this.data = new Array(width * height);
      for (let i = 0; i < this.data.length; i++) {
        this.data[i] = new cell(
          this,
          i % this.width,
          Math.floor(i / this.width)
        );
      }

      const transcoder = new Transcoder(source, this.data);
      this.decode(transcoder);

      this.history = new History(this);
    }

    decode(transcoder) {}

    get(x, y) {
      if (this.width <= x || x < 0) {
        return undefined;
      }
      return this.data[x + y * this.width];
    }
    set(x, y, change, rec = false) {
      if (rec) {
        this.history.record(x, y, change);
      }
      const index = x + y * this.width;
      Object.assign(this.data[index], change);
      Vue.set(this.data, index, this.data[index]);
    }

    judgment() {
      return this.data.every(cell => cell.correction());
    }
  }

  return Board;
});
