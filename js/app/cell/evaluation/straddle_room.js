define(function(require) {
  return (cell, count, marks = [1]) => {
    class Module extends cell {
      get straddleRoom() {
        return !(this.getStraddleRoom(1, 0) || this.getStraddleRoom(0, 1));
      }

      getStraddleRoom(addx, addy) {
        const rooms = [];
        rooms.push(this.room.index);
        for (let s = -1; s <= 1; s += 2) {
          for (let c = 1; true; c++) {
            const cell = this.cell(addx * c * s, addy * c * s);
            if (cell.wall || !marks.includes(cell.marked)) {
              break;
            }
            if (rooms.includes(cell.room.index)) {
              continue;
            }

            rooms.push(cell.room.index);
            if (rooms.length == count) {
              return true;
            }
          }
        }
      }
    }
    return Module;
  };
});
