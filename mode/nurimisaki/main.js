define(function(require) {
  class Board extends require("app/board") {
    decode(transcoder) {
      transcoder.decode4Cell();
    }
  }

  class Cell extends require("app/cell") {
    click(x, y) {
      if (this.wall) {
        return;
      }

      const change = {};

      if (this.paint) {
        change.paint = false;
        change.none = true;
      } else if (this.none) {
        change.none = false;
      } else {
        if (this.number > 0) {
          change.none = true;
        } else {
          change.paint = true;
        }
      }

      this.update(change);
    }

    images(images) {
      if (this.paint) {
        images.push({
          src: "mode/nurimisaki/img/paint.png",
          class: "bg"
        });
      } else if (this.none) {
        images.push({
          src: "mode/nurimisaki/img/none.png",
          class: "bg"
        });
      } else {
        images.push({
          src: "img/cell/floor.png",
          class: "bg"
        });
      }

      if (this.circle) {
        images.push({
          src: "mode/nurimisaki/img/circle.png",
          class: "bg"
        });
        this.numberimage(images);
      }

      return false;
    }

    set qnum(value) {
      switch (value) {
        case -1:
          this.circle = false;
          this.none = false;
          this.bright = 0;
          break;

        case -2:
          this.circle = true;
          break;

        default:
          this.circle = true;
          this.number = value;
          break;
      }
    }

    white(strict) {
      return strict ? this.none : !this.paint;
    }

    correction(strict) {
      // 岬の場合、1方のみが白ならOK
      // それ以外ならNG
      if (this.circle) {
        let whites = [];
        const arounds = [
          [-1, 0],
          [1, 0],
          [0, -1],
          [0, 1]
        ];
        for (const around of arounds) {
          whites.push(this.countwhite(around[0], around[1], strict));
        }
        const open = whites.filter(white => white >= 2);
        if (open.length == 1) {
          if (!this.number) {
            return true;
          }
          if (this.number == open[0]) {
            return true;
          } else if (this.number > open[0]) {
            return false;
          }
          return true;
        } else if (open.length == 0) {
          return false;
        }
      }

      return null;
    }

    countwhite(addx, addy, strict) {
      for (let count = 0; true; count++) {
        const cell = this.cell(addx * count, addy * count);
        if (cell.wall || !cell.white(strict)) {
          return count;
        }
      }
    }

    set light(value) {
      this.dlight = value;
      this.ray(value);
    }
    get light() {
      return this.dlight;
    }

    ray(value) {
      Vue.set(this, "bright", this.bright + (value ? 1 : -1));
      this.setBrights(1, 0, value);
      this.setBrights(-1, 0, value);
      this.setBrights(0, 1, value);
      this.setBrights(0, -1, value);
    }

    setBrights(addx, addy, value) {
      let x = addx;
      let y = addy;
      while (true) {
        const cell = this.cell(x, y);
        if (cell.wall) {
          break;
        }
        Vue.set(cell, "bright", cell.bright + (value ? 1 : -1));
        x += addx;
        y += addy;
      }
    }
  }

  return {
    board: Board,
    cell: Cell
  };
});
