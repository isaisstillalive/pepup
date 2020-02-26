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

    this.pincount = 0;
    this.pin = false;
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
      if (this.pin) {
        this.pincount += 1;
        change.pin = this.pincount;
        this.pin = false;
      }
      this.record(x, y, change);
    }
    const index = x + y * width;
    Object.assign(this.data[index], change);
    this.changed(x, y, change);
    Vue.set(this.data, index, this.data[index]);
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
    return this.historyIndex > 0 && !this.history[this.historyIndex - 1].to.pin;
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

  pin() {
    if (!this.doRedo) {
      return;
    }
    const record = this.history[this.historyIndex];
    this.historyIndex += 1;
    this.set(record.x, record.y, record.to);
  }
  get hasPin() {
    return this.pincount > 0;
  }
  dispose() {
    if (!this.hasPin) {
      return;
    }
    this.historyIndex -= 1;
    for (; this.historyIndex >= 0; this.historyIndex--) {
      const record = this.history[this.historyIndex];
      this.set(record.x, record.y, record.from);
      if (record.to.pin !== undefined) {
        break;
      }
    }
    this.history.splice(this.historyIndex, 99999);
    this.pincount -= 1;
  }
  confirm() {
    if (!this.hasPin) {
      return;
    }
    for (let index = this.historyIndex - 1; index >= 0; index--) {
      const record = this.history[index];
      if (record.to.pin !== undefined) {
        record.to.pin = undefined;
        this.set(record.x, record.y, { pin: undefined });
        break;
      }
    }
    this.pincount -= 1;
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
      },
      cursor: {
        type: Object
      }
    },
    computed: {
      current() {
        return this.board.get(this.x, this.y);
      }
    },
    methods: {
      click() {
        if (this.cursor.x == undefined) {
          this.board.click(this.x, this.y);
        } else {
          this.cursor.x = this.x;
          this.cursor.y = this.y;
        }
      }
    },
    mixins: [game.cell]
  });

  const app = new Vue({
    el: "#app",
    data: {
      board: new game.board(width, height, source),
      cursor: { x: 0, y: 0 },
      touch: {},
      border: 1
    },
    methods: {
      undo() {
        this.board.undo();
      },
      redo() {
        this.board.redo();
      },
      dispose() {
        this.board.dispose();
      },
      confirm() {
        this.board.confirm();
      },
      touchstart(event){
        this.touch = {
          id: event.changedTouches[0].identifier,
          startX: event.changedTouches[0].pageX,
          startY: event.changedTouches[0].pageY,
          cursorX: this.cursor.x,
          cursorY: this.cursor.y
        };
      },
      touchmove(event) {
        const touch = Array.from(event.changedTouches).find(touch => touch.identifier == this.touch.id);
        if (touch === undefined) {
          return;
        }
        const movedX = touch.pageX - this.touch.startX;
        const movedY = touch.pageY - this.touch.startY;

        this.cursor.x = Math.min(Math.max(0, this.touch.cursorX + Math.floor(movedX / 25)), this.width-1);
        this.cursor.y = Math.min(Math.max(0, this.touch.cursorY + Math.floor(movedY / 25)), this.height-1);
      },
      touchend(event){
        this.touch = {};
      },
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
      hasPin() {
        return this.board.hasPin;
      },
      pin: {
        get() {
          return this.board.pin;
        },
        set(value) {
          this.board.pin = value;
        }
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
