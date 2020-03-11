define(function(require) {
  return (cell, marks = [1]) => {
    class Module extends cell {
      get adjacentMarks() {
        if (this.number == null) {
          return true;
        }

        const { filled, marks } = this.getAdjacentMarks();
        if (filled) {
          if (marks == this.number) {
            return true;
          } else {
            return false;
          }
        } else if (marks > this.number) {
          return false;
        }

        return null;
      }

      getAdjacentMarks() {
        let result = {
          marks: 0,
          filled: 0
        };

        for (const cell of this.board.around(this.x, this.y)) {
          if (marks.includes(cell.marked)) {
            result.marks += 1;
            result.filled += 1;
          } else if (cell.filled) {
            result.filled += 1;
          }
        }

        result.filled = result.filled == 4;

        return result;
      }
    }
    return Module;
  };
});
