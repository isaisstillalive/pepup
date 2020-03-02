define(function(require) {
  class Transcoder {
    constructor(board, source, width, height, cell, room) {
      this.board = board;
      this.source = source;
      this.width = width;
      this.height = height;

      this.board.cells = new Array(width * height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = x + y * width;
          this.board.cells[i] = new cell(board, x, y);
        }
      }

      this.room = room;
      this.board.rooms = [];
    }

    get cells() {
      return this.board.cells;
    }

    get rooms() {
      return this.board.rooms;
    }

    newRoom() {
      const room = new this.room(this, this.rooms.length);
      this.rooms.push(room);
      return room;
    }

    *decodeIterator(source, target) {
      this.cursor = 0;
      for (let i = 0; i < source.length && this.cursor < target.length; i++) {
        const cell = target[this.cursor];

        const number = this.parse(i);
        const current = this.cursor;
        yield [number, cell];

        const max = Math.min(this.cursor, target.length);
        for (let c = current+1; c < max; c++) {
          target[c].qnum = -1;
        }
        this.cursor += 1;
      }
    }

    parse(i){
      const char = this.source.charAt(i);
      switch (char) {
        case ".":
          return -2;

        default:
          return parseInt(char, 36);
      }
    }

    decode4Cell() {
      for (const result of this.decodeIterator(this.source, this.cells)) {
        const number = result[0];
        const cell = result[1];

        if (number == -2) {
          cell.qnum = -2;
        } else if (number <= 4) {
          cell.qnum = number;
        } else if (number <= 9) {
          cell.qnum = number - 5;
          this.cursor += 1;
        } else if (number <= 15) {
          cell.qnum = number - 10;
          this.cursor += 2;
        } else {
          cell.qnum = -1;
          this.cursor += number - 16;
        }
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
      const twi = [16, 8, 4, 2, 1];

      let i = 0;
      let c = 1;
      for (; i < this.source.length && c < this.cells.length; i++) {
        const char = this.source.charAt(i);
        const ca = parseInt(char, 32);

        for (var w = 0; w < 5 && c < this.cells.length; w++) {
          if ((ca & twi[w]) == twi[w]) {
            this.cells[c].wleft = true;
          }
          c += 1;
          if (c % this.width == 0) {
            c += 1;
          }
        }
      }
      c = this.width;
      for (; i < this.source.length && c < this.cells.length; i++) {
        const char = this.source.charAt(i);
        const ca = parseInt(char, 32);

        for (var w = 0; w < 5 && c < this.cells.length; w++) {
          if ((ca & twi[w]) == twi[w]) {
            this.cells[c].wtop = true;
          }
          c += 1;
        }
      }

      this.source = this.source.substr(i);

      this.setRooms();
    }

    decodeRoomNumber16() {
      for (const result of this.decodeIterator(this.source, this.rooms)) {
        const number = result[0];
        const room = result[1];

        if (number == -2) {
          room.qnum = -2;
        } else if (number <= 4) {
          room.qnum = number;
        } else if (number <= 9) {
          room.qnum = number - 5;
          this.cursor += 1;
        } else if (number <= 15) {
          room.qnum = number - 10;
          this.cursor += 2;
        } else {
          room.qnum = -1;
          this.cursor += number - 16;
        }
      }
    }

    setRooms() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.setRoom(x, y);
        }
      }
    }
    setRoom(x, y) {
      const it = this.board.recursion(x, y);
      let result = it.next();
      if (result.value.room !== undefined) {
        return;
      }

      const room = this.newRoom();
      while (!result.done) {
        const cell = result.value;
        const dirs = [!cell.wleft, !cell.wright, !cell.wtop, !cell.wbottom];

        room.addCell(cell);

        result = it.next(dirs);
      }
    }
  }

  return Transcoder;
});
