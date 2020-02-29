define(function(require) {
  class Transcoder {
    constructor(source, width, height, cell) {
      this.source = source;
      this.width = width;
      this.height = height;

      this.cells = new Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = x + y * width;
          this.cells[i] = cell(x, y);
        }
      }

      this.rooms = [];
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

  return Transcoder;
});
