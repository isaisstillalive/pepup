define(function(require) {
  class Transcoder {
    constructor(board, source, width, height, cell) {
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

      this.board.rooms = [];
    }

    get cells() {
      return this.board.cells;
    }

    get rooms() {
      return this.board.rooms;
    }

    *decodeIterator(source, target) {
      let c = 0;
      for (let i = 0; i < source.length && c < this.cells.length; i++) {
        const cell = target[c];

        const char = this.source.charAt(i);
        let skip = yield [char, cell];

        c += 1;
        for (let i = 0; i < skip && c < target.length; i++) {
          target[c].qnum = -1;
          c += 1;
        }
      }
    }

    decode4Cell() {
      const it = this.decodeIterator(this.source, this.cells);
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
      const it = this.decodeIterator(this.source, this.rooms);
      let result = it.next();
      while (!result.done) {
        const char = result.value[0];
        const room = result.value[1];

        let skip;
        if (char === ".") {
          room[0].qnum = -2;
        } else {
          const number = parseInt(char, 36);
          if (number <= 4) {
            room[0].qnum = number;
          } else if (number <= 9) {
            room[0].qnum = number - 5;
            skip = 1;
          } else if (number <= 15) {
            room[0].qnum = number - 10;
            skip = 2;
          } else {
            room[0].qnum = -1;
            skip = number - 16;
          }
        }
        result = it.next(skip);
      }
    }

    setRooms() {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          this.setRoom(this.board.get(x, y));
        }
      }
    }
    setRoom(cell, room, rooms) {
      if (cell.wall || cell.room !== undefined) {
        return;
      }
      if (room === undefined) {
        rooms = [];
        this.rooms.push(rooms);
        room = this.rooms.length;
      }
      cell.room = room;
      rooms.push(cell);

      if (!cell.wleft) {
        this.setRoom(this.board.get(cell.x - 1, cell.y), room, rooms);
      }
      const right = this.board.get(cell.x + 1, cell.y);
      if (!right.wleft) {
        this.setRoom(right, room, rooms);
      }

      if (!cell.wtop) {
        this.setRoom(this.board.get(cell.x, cell.y - 1), room, rooms);
      }
      const bottom = this.board.get(cell.x, cell.y + 1);
      if (!bottom.wtop) {
        this.setRoom(bottom, room, rooms);
      }
    }
  }

  return Transcoder;
});
