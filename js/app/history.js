define(function(require) {
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
        to = Object.assign({}, to);
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

      return to;
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

  return History;
});
