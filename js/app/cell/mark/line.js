define(function(require) {
  return cell => {
    class Module extends cell {
      constructor(...args) {
        super(...args);
        this.line = null;
        this.left = 0;
        this.top = 0;
      }

      refresh() {
        super.refresh();
        this.line = null;
        this._loop = null;
        this.constructor.line = 0;
      }

      touch(position, change, opt) {
        return this.touchLine(position, change, opt);
      }

      touchLine(position, change, opt) {
        opt.line = undefined;
        return true;
      }

      enter(x, y, change, mark) {
        return this.enterLine(x, y, change, mark);
      }

      enterLine(x, y, change, mark) {
        let property;
        if (x <= -1) {
          property = "left";
        } else if (y <= -1) {
          property = "top";
        } else if (x >= 1) {
          property = "right";
        } else {
          property = "bottom";
        }
        if (mark.line === undefined) {
          mark.line = this[property] == 1 ? 0 : 1;
        }
        change[property] = mark.line;
        return true;
      }

      tap(position, change, opt) {
        return this.tapLine(position, change, opt);
      }

      tapLine(position, change, opt) {
        let property;
        if (position.angle <= -0.75 || position.angle > 0.75) {
          property = "left";
        } else if (position.angle <= -0.25) {
          property = "top";
        } else if (position.angle <= 0.25) {
          property = "right";
        } else {
          property = "bottom";
        }
        change[property] = this[property] == 2 ? 0 : 2;
        return false;
      }

      imagesLine(images) {
        if (this.left == 1) {
          images.push("lline");
        } else if (this.left == 2) {
          images.push("lnone");
        }
        if (this.top == 1) {
          images.push("tline");
        } else if (this.top == 2) {
          images.push("tnone");
        }
      }

      get loop() {
        if (this._loop === null) {
          this.checkLoopAll();
        }
        return this._loop;
      }

      checkLoopAll() {
        for (const cell of this.board.cells) {
          cell.checkLoop();
        }
      }

      checkLoop() {
        if (this.junction == 0 || this._loop !== null) {
          return;
        }

        let loop = true;
        const cells = [];

        for (const { cell, dirs } of this.board.recursion(this.x, this.y)) {
          cells.push(cell);
          const lines = cell.lines.map(line => line == 1);
          for (let i = 0; i < 4; i++) {
            dirs[i] = lines[i];
          }
          if (cell.junction != 2) {
            loop = false;
          }
        }

        this.constructor.line += 1;
        const line = this.constructor.line;
        for (const cell of cells) {
          cell._loop = loop;
          cell.line = line;
        }
      }

      get lines() {
        return ["left", "top", "right", "bottom"].map(dir => this[dir]);
      }

      get junction() {
        return this.lines.filter(line => line == 1).length;
      }
      get horizontal() {
        return this.right == 1 || this.left == 1;
      }
      get vertical() {
        return this.top == 1 || this.bottom == 1;
      }

      set right(value) {
        if (this.x < this.board.width - 1) {
          this.cell(1, 0).left = value;
        }
      }
      get right() {
        if (this.x < this.board.width - 1) {
          return this.cell(1, 0).left;
        }
        return 0;
      }

      set bottom(value) {
        if (this.y < this.board.height - 1) {
          this.cell(0, 1).top = value;
        }
      }
      get bottom() {
        if (this.y < this.board.height - 1) {
          return this.cell(0, 1).top;
        }
        return 0;
      }
    }
    return Module;
  };
});
