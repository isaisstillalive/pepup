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
  constructor(width, height, source, cell) {
    this.width = width;
    this.height = height;
    this.source = source;

    this.data = new Array(width * height);
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = new cell(this, i % this.width, Math.floor(i / this.width));
    }
    this.decode(source);

    this.pincount = 0;
    this.pin = false;
    this.historyIndex = 0;
    this.history = [];
  }

  decode(source) {}
  *decodeIterator(source) {
    let c = 0;
    for (let i = 0; i < source.length && c < this.data.length; i++) {
      const cell = this.data[c];

      const char = source.charAt(i);
      let skip = yield [char, cell];

      c += 1;
      for (let i = 0; i < skip && c < this.data.length; i++) {
        this.data[c].qnum = -1;
        c += 1;
      }
    }
  }
  decode4Cell(source) {
    const it = this.decodeIterator(source);
    let result = it.next();
    while (!result.done) {
      const char = result.value[0];
      const cell = result.value[1];

      let skip;
      if (char === ".") {
        cell.qnum = -2;
      } else {
        const number = parseInt(char, 36);
        if (number <= 4) {
          cell.qnum = number;
        } else if (number <= 9) {
          cell.qnum = number - 5;
          skip = 1;
        } else if (number <= 15) {
          cell.qnum = number - 10;
          skip = 2;
        } else {
          skip = number - 16;
        }
      }
      result = it.next(skip);
    }
  }

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

class BaseCell {
  constructor(board, x, y) {
    this.board = board;
    this.x = x;
    this.y = y;
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
      },
      images() {
        if (this.current) return this.current.images();
      }
    }
  });

  const app = new Vue({
    el: "#app",
    data: {
      board: new game.board(width, height, source, game.cell),
      cursor: { x: 0, y: 0 },
      touch: {},
      border: 1
    },
    methods: {
      setCursor(x, y) {
        this.cursor.x = x;
        this.cursor.y = y;
      },
      clickCell(x, y, event) {
        const clientRect = event.currentTarget.getBoundingClientRect();
        const touchX = event.changedTouches[0].clientX - clientRect.left;
        const touchY = event.changedTouches[0].clientY - clientRect.top;
        this.board.click(x, y, {
          x: touchX / clientRect.width,
          y: touchY / clientRect.height
        });
      },
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
      touchstart(event) {
        this.touch = {
          id: event.changedTouches[0].identifier,
          startX: event.changedTouches[0].pageX,
          startY: event.changedTouches[0].pageY,
          cursorX: this.cursor.x,
          cursorY: this.cursor.y
        };
      },
      touchmove(event) {
        const touch = Array.from(event.changedTouches).find(
          touch => touch.identifier == this.touch.id
        );
        if (touch === undefined) {
          return;
        }
        const movedX = touch.pageX - this.touch.startX;
        const movedY = touch.pageY - this.touch.startY;

        this.cursor.x = Math.min(
          Math.max(0, this.touch.cursorX + Math.floor(movedX / 25)),
          this.width - 1
        );
        this.cursor.y = Math.min(
          Math.max(0, this.touch.cursorY + Math.floor(movedY / 25)),
          this.height - 1
        );
      },
      touchend(event) {
        this.touch = {};
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
