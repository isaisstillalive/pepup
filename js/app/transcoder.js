define(function(require) {
  class Transcoder {
    constructor(board, source, width, height, cell, room) {
      this.board = board;
      this.position = 0;
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

    *decodeIterator(target) {
      this.cursor = 0;
      for (; this.position < this.source.length && this.cursor < target.length; this.position++) {
        const cell = target[this.cursor];

        const current = this.cursor;
        yield cell;

        this.cursor += 1;
        const max = Math.min(this.cursor, target.length);
        for (let c = current+1; c < max; c++) {
          target[c].qnum = -1;
        }
      }
    }

    read(){
      const char = this.source.charAt(this.position);

      let number;

      switch (char) {
        case ".":
          return -2;

        case "-":
          number = parseInt(this.source.substr(this.position+1, 2), 16);
          this.position += 2;
          return number;

        case "+":
          number = parseInt(this.source.substr(this.position+1, 3), 16);
          this.position += 3;
          return number;

        case "=":
          number = parseInt(this.source.substr(this.position+1, 3), 16) + 4096;
          this.position += 3;
          return number;

        case "%":
          number = parseInt(this.source.substr(this.position+1, 3), 16) + 8192;
          this.position += 3;
          return number;

        case "*":
          number = parseInt(this.source.substr(this.position+1, 4), 16) + 12240;
          this.position += 4;
          return number;

        case "$":
          number = parseInt(this.source.substr(this.position+1, 5), 16) + 77776;
          this.position += 5;
          return number;

        default:
          return parseInt(char, 36);
      }
    }

    read4() {
      const number = this.read();

      if (number == -2) {
        return -2;
      } else if (number <= 4) {
        return number;
      } else if (number <= 9) {
        this.cursor += 1;
        return number - 5;
      } else if (number <= 15) {
        this.cursor += 2;
        return number - 10;
      } else {
        this.cursor += number - 16;
        return -1;
      }
    }

    readNumber16() {
      const number = this.read();

      if (number >= 16 && number <= 35) {
        this.cursor += number - 16;
        return -1;
      } else {
        return number;
      }
    }

    decode4Cell() {
      for (const cell of this.decodeIterator(this.cells)) {
        cell.qnum = this.read4();
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

    decodeNumber16() {
      for (const cell of this.decodeIterator(this.cells)) {
        cell.qnum = this.readNumber16();
      }
    }

    decodeRoomNumber16() {
      for (const room of this.decodeIterator(this.rooms)) {
        room.qnum = this.readNumber16();
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
