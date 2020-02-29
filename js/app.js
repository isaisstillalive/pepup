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

    this.data = new Array(width * height);
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = new cell(this, i % this.width, Math.floor(i / this.width));
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
    return this.data[x + y * width];
  }
  set(x, y, change, rec = false) {
    if (rec) {
      this.history.record(x, y, change);
    }
    const index = x + y * width;
    Object.assign(this.data[index], change);
    Vue.set(this.data, index, this.data[index]);
  }

  judgment() {
    return this.data.every(cell => cell.correction());
  }
}

class BaseCell {
  constructor(board, x, y) {
    this.board = board;
    this.x = x;
    this.y = y;
  }

  cell(addx, addy) {
    return this.board.get(this.x + addx, this.y + addy);
  }

  update(change) {
    this.board.set(this.x, this.y, change, true);
  }

  correction() {
    // そのセルが完成していなければnull
    // ルールに則っていればtrue
    // ルールから逸脱していればfalse
    return true;
  }
}

class History {
  constructor(board) {
    this.board = board;
    this.value = [];
    this.index = 0;
    this.pincount = 0;
    this.pin = false;
  }

  record(x, y, to) {
    const current = this.board.get(x, y);

    if (this.pin) {
      this.pincount += 1;
      to.pin = this.pincount;
      this.pin = false;
    }

    const from = {};
    for (const key in to) {
      from[key] = current[key];
    }

    this.value.splice(this.index, 99999, {
      x: x,
      y: y,
      from: from,
      to: to
    });
    this.index += 1;
  }

  get doUndo() {
    return this.index > 0 && !this.value[this.index - 1].to.pin;
  }
  get doRedo() {
    return this.index < this.value.length;
  }
  undo() {
    if (!this.doUndo) {
      return;
    }
    this.index -= 1;
    const record = this.value[this.index];
    this.board.set(record.x, record.y, record.from);
  }
  redo() {
    if (!this.doRedo) {
      return;
    }
    const record = this.value[this.index];
    this.index += 1;
    this.board.set(record.x, record.y, record.to);
  }

  pin() {
    if (!this.doRedo) {
      return;
    }
    const record = this.value[this.index];
    this.index += 1;
    this.board.set(record.x, record.y, record.to);
  }
  get hasPin() {
    return this.pincount > 0;
  }
  dispose() {
    if (!this.hasPin) {
      return;
    }
    this.index -= 1;
    for (; this.index >= 0; this.index--) {
      const record = this.value[this.index];
      this.board.set(record.x, record.y, record.from);
      if (record.to.pin !== undefined) {
        break;
      }
    }
    this.value.splice(this.index, 99999);
    this.pincount -= 1;
  }
  confirm() {
    if (!this.hasPin) {
      return;
    }
    for (let index = this.index - 1; index >= 0; index--) {
      const record = this.value[index];
      if (record.to.pin !== undefined) {
        record.to.pin = undefined;
        this.board.set(record.x, record.y, { pin: undefined });
        break;
      }
    }
    this.pincount -= 1;
  }
}

class Transcoder {
  constructor(source, cells) {
    this.source = source;
    this.cells = cells;
  }

  *decodeIterator() {
    let c = 0;
    for (let i = 0; i < this.source.length && c < this.cells.length; i++) {
      const cell = this.cells[c];

      const char = this.source.charAt(i);
      let skip = yield [char, cell];

      c += 1;
      for (let i = 0; i < skip && c < this.cells.length; i++) {
        this.cells[c].qnum = -1;
        c += 1;
      }
    }
  }

  decode4Cell() {
    const it = this.decodeIterator(this.source);
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
          cell.qnum = -1;
          skip = number - 16;
        }
      }
      result = it.next(skip);
    }
  }
  decodeCircle() {
    const tri = [9, 3, 1];

    let c = 0;
    for (let i = 0; i < this.source.length; i++) {
      const char = this.source.charAt(i);

      const ca = parseInt(char, 27);
      for (let w = 0; w < 3 && c < this.cells.length; w++) {
        const cell = this.cells[c];
        const val = ((ca / tri[w]) | 0) % 3;
        cell.qnum = val;
        c += 1;
      }
    }
  }
  decodeBorder() {
    // 	var pos1,
    //   pos2,
    //   bstr = this.outbstr,
    //   id,
    //   twi = [16, 8, 4, 2, 1];
    // var bd = this.board;
    // if (bstr) {
    //   pos1 = Math.min((((bd.cols - 1) * bd.rows + 4) / 5) | 0, bstr.length);
    //   pos2 = Math.min(
    //     (((bd.cols * (bd.rows - 1) + 4) / 5) | 0) + pos1,
    //     bstr.length
    //   );
    // } else {
    //   pos1 = 0;
    //   pos2 = 0;
    // }
    // id = 0;
    // for (var i = 0; i < pos1; i++) {
    //   var ca = parseInt(bstr.charAt(i), 32);
    //   for (var w = 0; w < 5; w++) {
    //     if (id < (bd.cols - 1) * bd.rows) {
    //       bd.border[id].ques = ca & twi[w] ? 1 : 0;
    //       id++;
    //     }
    //   }
    // }
    // id = (bd.cols - 1) * bd.rows;
    // for (var i = pos1; i < pos2; i++) {
    //   var ca = parseInt(bstr.charAt(i), 32);
    //   for (var w = 0; w < 5; w++) {
    //     var border = bd.border[id];
    //     if (!!border && border.inside) {
    //       border.ques = ca & twi[w] ? 1 : 0;
    //       id++;
    //     }
    //   }
    // }
    // bd.roommgr.rebuild();
    // this.outbstr = bstr.substr(pos2);
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
        if (this.current) return this.current.images(this.current.correction());
      }
    }
  });

  const app = new Vue({
    el: "#app",
    data: {
      board: new game.board(width, height, source, game.cell),
      cursor: { x: 0, y: 0 },
      touch: {}
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
        this.board
          .get(x, y)
          .click(touchX / clientRect.width, touchY / clientRect.height);
      },
      undo() {
        this.board.history.undo();
      },
      redo() {
        this.board.history.redo();
      },
      dispose() {
        this.board.history.dispose();
      },
      confirm() {
        this.board.history.confirm();
      },
      judgment() {
        if (this.board.judgment()) {
          alert("完成");
        } else {
          alert("未完成");
        }
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
        return this.board.history.doUndo;
      },
      doRedo() {
        return this.board.history.doRedo;
      },
      hasPin() {
        return this.board.history.hasPin;
      },
      pin: {
        get() {
          return this.board.history.pin;
        },
        set(value) {
          this.board.history.pin = value;
        }
      },
      cellsize() {
        return Math.floor(Math.min(320 / this.width, 430 / this.height));
      },
      boardsize() {
        return {
          width: this.cellsize * this.width + "px",
          height: this.cellsize * this.height + "px"
        };
      }
    }
  });
});
