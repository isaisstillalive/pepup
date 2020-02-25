const query = location.search.slice(1).split("/");
const game = query[0];
const width = Number.parseInt(query[1]);
const height = Number.parseInt(query[2]);
const source = query[3];

// Safariのスクロール禁止
window.addEventListener("touchmove", event => event.preventDefault(), {
  passive: false
});

class BaseBoard {
  constructor(width, height, source) {
    this.width = width;
    this.height = height;
    this.source = source;

    this.data = new Array(width * height);
    this.initialize();

    this.historyIndex = 0;
    this.history = [];
  }

  initialize() {}

  get(x, y) {
    if (this.width <= x || x < 0) {
      return undefined;
    }
    return this.data[x + y * width];
  }
  set(x, y, change, rec = false) {
    if (rec) {
      this.record(x, y, change);
    }
    Object.assign(this.data[x + y * width], change);
    this.changed(x, y, change);
  }

  record(x, y, to) {
    const current = this.get(x, y);
    const from = {};
    for (const key in to) {
      from[key] = current[key];
    }
    this.history.splice(this.historyIndex, 99999, {
      x: x,
      y: y,
      from: from,
      to: to
    });
    this.historyIndex += 1;
  }

  get doUndo() {
    return this.historyIndex != 0;
  }
  get doRedo() {
    return this.historyIndex < this.history.length;
  }
  undo() {
    if (!this.doUndo) {
      return;
    }
    this.historyIndex -= 1;
    const record = this.history[this.historyIndex];
    this.set(record.x, record.y, record.from);
  }
  redo() {
    if (!this.doRedo) {
      return;
    }
    const record = this.history[this.historyIndex];
    this.historyIndex += 1;
    this.set(record.x, record.y, record.to);
  }
}

requirejs([`../mode/${game}/main`], function(game) {
  Vue.component("cell", {
    template: "#cell",
    props: {
      board: {
        type: game.board
      },
      x: {
        type: Number
      },
      y: {
        type: Number
      }
    },
    computed: {
      current() {
        return this.board.get(this.x, this.y);
      }
    },
    methods: {
      click() {
        this.board.click(this.x, this.y);
      }
    },
    mixins: [game.cell]
  });

  const app = new Vue({
    el: "#app",
    data: {
      board: new game.board(width, height, source),
      border: 1
    },
    methods: {
      undo() {
        this.board.undo();
      },
      redo() {
        this.board.redo();
      }
    },
    computed: {
      width() {
        return this.board.width;
      },
      height() {
        return this.board.height;
      },
      doUndo() {
        return this.board.doUndo;
      },
      doRedo() {
        return this.board.doRedo;
      },
      cellsize() {
        return Math.floor(
          Math.min(
            (320 - this.border) / this.width,
            (430 - this.border) / this.height
          ) - this.border
        );
      },
      boardsize() {
        return {
          width:
            (this.cellsize + this.border) * this.width + 3 * this.border + "px",
          height:
            (this.cellsize + this.border) * this.height + 3 * this.border + "px"
        };
      }
    }
  });
});
